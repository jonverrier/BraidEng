/*! Copyright Braid Technologies 2022 */
// The ConversationController manages the interaction with the shared data structures, and drives a ConversationView
// ConversationPage is largely a passive view, although it does notify the controller if the local users adds a message.

// React
import React, { useState } from 'react';

// Local
import { throwIfUndefined } from '../core/Asserts';
import { Persona } from '../core/Persona';
import { Message } from '../core/Message';
import { CaucusOf } from '../core/CaucusFramework';
import { JoinPath } from '../core/JoinPath';
import { JoinPageValidator } from '../core/JoinPageValidator';
import { ConversationRow } from './ConversationRow';
import { MessageBotFluidConnection } from '../core/MessageBotFluidConnection';
import { Interest, NotificationFor, NotificationRouterFor, ObserverInterest } from '../core/NotificationFramework';
import { AIConnection, AIConnector } from '../core/AIConnection';
import { EUIStrings } from './UIStrings';
import { EConfigNumbers, EConfigStrings } from '../core/ConfigStrings';
import { KnowledgeEnrichedMessage, KnowledgeSegment, KnowledgeRepository } from '../core/Knowledge';
import { getRecordRepository } from '../core/ActivityRepository';
import { UrlActivityRecord } from '../core/UrlActivityRecord';

export interface IConversationControllerProps {

   joinPath: JoinPath;
   localPersona: Persona; 
   onFluidError (hint_: string) : void;   
   onAiError (hint_: string) : void;        
}

// create a forceUpdate hook
// https://stackoverflow.com/questions/46240647/how-to-force-a-functional-react-component-to-render
function useForceUpdate() {
   const [value, setValue] = useState(0); // simple integer state
   return () => setValue(value => value + 1); // update state to force render
}

export const ConversationControllerRow = (props: IConversationControllerProps) => {

   const [conversation, setConversation] = useState<Array<Message>>(new Array<Message>());
   const [audience, setAudience] = useState<Map<string, Persona>>(new Map<string, Persona>());
   const [fluidConnection, setFluidConnection] = useState<MessageBotFluidConnection | undefined>(undefined);
   const [joining, setJoining] = useState<boolean> (false);
   const [fullJoinKey, setFullJoinKey] = useState<JoinPath> (props.joinPath);
   const [isBusy, setIsBusy] = useState<boolean>(false);
   const [suggested, setSuggested] = useState<Message|undefined>(undefined);

   function addMessage (fluidMessagesConnection_: MessageBotFluidConnection, message_: Message) : void {

      fluidMessagesConnection_.messageCaucus().add (message_.id, message_);

      // Save state and force a refresh                  
      let messageArray = fluidMessagesConnection_.messageCaucus().currentAsArray();      
      setConversation (messageArray);                
      forceUpdate ();         
   }

   function hasRecentHepfulStart (fluidMessagesConnection_: MessageBotFluidConnection) : boolean {

      let messageArray = fluidMessagesConnection_.messageCaucus().currentAsArray();  

      let currentTime = new Date();
      
      for (let i = 0; i < messageArray.length; i++) {

         if (messageArray[i].authorId === EConfigStrings.kLLMGuid
            && messageArray[i].isUnPrompted()) {

               let messageTime = messageArray[i].sentAt;

               let difference = currentTime.getTime() - messageTime.getTime();

               if (difference < EConfigNumbers.kHelpfulPromptMinimumGapMins * 60 * 1000) {
                  return true;
               }
         }
      }

      return false;
   }

   function makeHelpfulStart (fluidMessagesConnection_: MessageBotFluidConnection) : void {

      setIsBusy (true);

      setTimeout(() => {

         if (! hasRecentHepfulStart (fluidMessagesConnection_)) {
            if (!suggested) {
             let suggestion = KnowledgeRepository.lookForSuggestedContent (undefined);
             setSuggested (suggestion);
            }
         } 
         setIsBusy (false);

      }, EConfigNumbers.kHelpfulPromptDelayMsecs);  
   }

   function initialiseConnectionState (fluidMessagesConnection_: MessageBotFluidConnection, 
      containerId: string) : void {

      setFluidConnection (fluidMessagesConnection_);  

      // Notifications function for adds, removes, changes
      // Warning - this function must be decalred after the call to setFluidConnection(), else it binds to the original value - which is always undefined. 
      // **************************************
      let remoteChanged = function (interest: Interest, data: NotificationFor<Message>) : void {

         let offlineRefresh = function () {       

            if (typeof fluidMessagesConnection_ !== "undefined") {

               throwIfUndefined(fluidMessagesConnection_);   // This is just to keep the compiler happy with statement below. 
               let messageArray = fluidMessagesConnection_.messageCaucus().currentAsArray();
               setConversation (messageArray); 
               let audienceMap = fluidMessagesConnection_.participantCaucus().current();
               setAudience (audienceMap);               
            }
         }

         offlineRefresh();    
         forceUpdate ();            
      }      

      let messageArray = fluidMessagesConnection_.messageCaucus().currentAsArray();
      setConversation (messageArray);
      let audienceMap = fluidMessagesConnection_.participantCaucus().current();
      setAudience (audienceMap);

      let changeObserver = new NotificationRouterFor<Message> (remoteChanged);

      let changeObserverInterest = new ObserverInterest (changeObserver, CaucusOf.caucusMemberChangedInterest);
      let addedObserverInterest = new ObserverInterest (changeObserver, CaucusOf.caucusMemberAddedInterest);      
      let removedObserverInterest = new ObserverInterest (changeObserver, CaucusOf.caucusMemberRemovedInterest);

      // Hook up a notification function for adds, removes, changes in the message list       
      fluidMessagesConnection_.messageCaucus().addObserver (changeObserverInterest);
      fluidMessagesConnection_.messageCaucus().addObserver (addedObserverInterest);   
      fluidMessagesConnection_.messageCaucus().addObserver (removedObserverInterest);  
      
      // Hook up a notification function for adds, removes, changes in the participant list 
      fluidMessagesConnection_.participantCaucus().addObserver (changeObserverInterest);
      fluidMessagesConnection_.participantCaucus().addObserver (addedObserverInterest);   
      fluidMessagesConnection_.participantCaucus().addObserver (removedObserverInterest);       
      
      setFullJoinKey (JoinPath.makeFromTwoParts (props.joinPath.sessionId, containerId));  

      makeHelpfulStart (fluidMessagesConnection_);              
   }

   let validater = new JoinPageValidator();

   if (validater.isJoinAttemptReady (props.localPersona.name, props.joinPath) && 
      fluidConnection === undefined 
      && !joining) {

      setJoining(true);

      let joinKey = props.joinPath;

      let fluidMessagesConnection = new MessageBotFluidConnection ( {}, props.localPersona);
      
      if (joinKey.hasSessionOnly) {

         fluidMessagesConnection.createNew (joinKey.sessionId).then (containerId => {
        
            initialiseConnectionState (fluidMessagesConnection, containerId);
            setJoining (false);

         }).catch ((e : any) => {
         
            props.onFluidError (e? e.toString() : "Error creating new conversation, " + joinKey.conversationId + ".");
            setJoining (false);
         })
      }
      else if (joinKey.hasSessionAndConversation) {

         fluidMessagesConnection.attachToExisting (joinKey.sessionId, joinKey.conversationId).then (containerId => {

            initialiseConnectionState (fluidMessagesConnection, joinKey.conversationId);
         
            setJoining (false);

         }).catch ((e: any) => {
         
            props.onFluidError (e? e.toString() : EUIStrings.kJoinApiError + " :" + joinKey.conversationId + ".");
            setJoining (false);
         })
      }
   }

   audience.set (props.localPersona.id, props.localPersona);

   // call the force update hook 
   const forceUpdate = useForceUpdate();   
   
   function refreshAfterTrim () : void {

      throwIfUndefined (fluidConnection);
      let fluidMessagesConnection : MessageBotFluidConnection = fluidConnection;    

      // Save state and force a refresh
      let messageArray = fluidMessagesConnection.messageCaucus().currentAsArray();      
      let audienceMap = fluidMessagesConnection.participantCaucus().current();
      setAudience (audienceMap);      
      setConversation (messageArray);                
      forceUpdate ();       
   }

   function onTrimConversation () : void {

      throwIfUndefined (fluidConnection);
      let fluidMessagesConnection : MessageBotFluidConnection = fluidConnection;      
      fluidMessagesConnection.resetMessages ();  
      refreshAfterTrim ();        
   }

   function onClickUrl (url_: string) : void {
      let repository = getRecordRepository(props.joinPath.sessionId);
      let email = props.localPersona.name;
      let record = new UrlActivityRecord (undefined, email, new Date(), url_);
      repository.save (record);   
      
      let suggested = KnowledgeRepository.lookForSuggestedContent (url_);
      if (suggested)
         setSuggested (suggested);
   }

   function onAddSuggestedContent () {

      throwIfUndefined (fluidConnection);
      let fluidMessagesConnection : MessageBotFluidConnection = fluidConnection;

      throwIfUndefined (suggested);      
      addMessage (fluidMessagesConnection, suggested); 

      setSuggested (undefined);
   }

   function onSend (messageText_: string) : void {

      throwIfUndefined (fluidConnection);
      let fluidMessagesConnection : MessageBotFluidConnection = fluidConnection;

      // set up a message to append
      let message = new Message ();
      message.authorId = props.localPersona.id;
      message.text = messageText_;
      message.sentAt = new Date();

      // Push it to shared data
      fluidMessagesConnection.messageCaucus().add (message.id, message);
      // Update the timestamp of the person who posted it
      let storedPerson = fluidMessagesConnection.participantCaucus().get (props.localPersona.id);
      storedPerson.lastSeenAt = message.sentAt;
      fluidMessagesConnection.participantCaucus().add (storedPerson.id, storedPerson);      

      // Save state and force a refresh
      let messageArray = fluidMessagesConnection.messageCaucus().currentAsArray();      
      setConversation (messageArray);      
      let audienceMap = fluidMessagesConnection.participantCaucus().current();
      setAudience (audienceMap);

      // If LLM is being invoked we make a call here 
      // ======================================================
      if (AIConnection.isRequestForLLM (message, audienceMap)) {

         setIsBusy(true);

         let connectionPromise = AIConnector.connect (props.joinPath.sessionId);

         connectionPromise.then ( (connection : AIConnection) => {

            let query = AIConnection.makeOpenAIQuery (messageArray, audienceMap);

            connection.queryAI (messageText_, query).then ((result_: KnowledgeEnrichedMessage) => {
               
               // set up a message to append
               let response = new Message ();
               response.authorId = EConfigStrings.kLLMGuid;
               response.text = result_.message;
               response.sentAt = new Date();
               response.responseToId = message.id;
               response.segments = result_.segments; // Add KnowledgeSegments

               // Push it to shared data
               addMessage (fluidMessagesConnection, response);

               setIsBusy(false);                         

            }).catch ( (e: any) => {
               
               props.onAiError (EUIStrings.kAiApiError);
               setIsBusy(false);                
            });            

         }).catch ( (e: any) => {
            props.onAiError (EUIStrings.kJoinApiError + " :" + props.joinPath.sessionId + ".");
            setIsBusy(false);             
         });
      }
      else
      // If the user looks they have miss-typed, we send a reminder.  
      // ======================================================      
      if (AIConnection.mightBeMissTypedRequestForLLM (message, audienceMap)) {

         // set up a message to append
         let response = new Message ();
         response.authorId = EConfigStrings.kLLMGuid;
         response.text = EUIStrings.kLLMNameReminder;
         response.sentAt = new Date();
         response.responseToId = message.id;

         // Push it to shared data
         addMessage (fluidMessagesConnection, response);                         
      }

      forceUpdate ();      
   }

   let joinValidator = new JoinPageValidator ();

   if (! joinValidator.isJoinAttemptReady (props.localPersona.name, props.joinPath)) {
      return (<div></div>);
   }
   else
      return (
         <ConversationRow 
             isConnected={fullJoinKey.isValid && fullJoinKey.hasSessionAndConversation}
             isBusy = {isBusy}
             joinPath={fullJoinKey}
             conversation={conversation}
             audience={audience} 
             hasSuggestedContent={suggested ? true: false}
             onSend={onSend} 
             onAddSuggestedContent={onAddSuggestedContent}
             onTrimConversation={onTrimConversation}
             onClickUrl={onClickUrl}
             >
         </ConversationRow>
      );
}

