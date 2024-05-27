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
import { SessionKey, ConversationKey } from '../core/Keys';
import { JoinDetails } from '../core/JoinDetails';
import { JoinPageValidator } from '../core/JoinPageValidator';
import { ConversationRow } from './ConversationRow';
import { MessageBotFluidConnection } from '../core/MessageBotFluidConnection';
import { Interest, NotificationFor, NotificationRouterFor, ObserverInterest } from '../core/NotificationFramework';
import { AIConnection, AIConnector } from '../core/AIConnection';
import { EUIStrings } from './UIStrings';
import { EConfigNumbers, EConfigStrings } from '../core/ConfigStrings';
import { getEmbeddingRepository } from '../core/IEmbeddingRepositoryFactory';
import { getRecordRepository } from '../core/IActivityRepositoryFactory';
import { UrlActivityRecord } from '../core/ActivityRecordUrl';
import { MessageActivityRecord } from '../core/MessageActivityRecord';
import { getDefaultKeyGenerator } from '../core/IKeyGeneratorFactory';
import { LikeDislikeActivityRecord } from '../core/ActivityRecordLikeDislike';

export interface IConversationControllerProps {

   sessionKey: SessionKey;
   conversationKey: ConversationKey;
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
   const [conversationKey, setConversationKey] = useState<ConversationKey> (props.conversationKey);   
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
               let embeddingRespository = getEmbeddingRepository (props.sessionKey);
               let suggestion = embeddingRespository.lookForRelatedContent (undefined, 
                                                                            EUIStrings.kNewUserNeedInspiration);
               suggestion.then ((message) => {
                  if (message)
                     setSuggested (message);
               });
            }
         } 
         setIsBusy (false);

      }, EConfigNumbers.kHelpfulPromptDelayMsecs);  
   }

   function initialiseConnectionState (fluidMessagesConnection_: MessageBotFluidConnection, 
                                       conversationKey_: ConversationKey) : void {

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
      
      setConversationKey (conversationKey_);  

      makeHelpfulStart (fluidMessagesConnection_);              
   }

   let validater = new JoinPageValidator();

   if (validater.isJoinAttemptReady (props.localPersona.email, props.localPersona.name, 
                                     props.sessionKey, props.conversationKey) && 
      fluidConnection === undefined 
      && !joining) {

      setJoining(true);

      let fluidMessagesConnection = new MessageBotFluidConnection ( {}, props.localPersona);
      
      if (! (props.conversationKey.looksValidConversationKey())) {

         fluidMessagesConnection.createNew (props.sessionKey).then (conversationKey_ => {
        
            initialiseConnectionState (fluidMessagesConnection, conversationKey_);
            setJoining (false);

         }).catch ((e : any) => {
         
            props.onFluidError ("Error creating new conversation, session: " + props.sessionKey.toString() + ".");
            setJoining (false);
         })
      }
      else {

         fluidMessagesConnection.attachToExisting (props.sessionKey, conversationKey).then (conversationKey_ => {

            initialiseConnectionState (fluidMessagesConnection, conversationKey_);
         
            setJoining (false);

         }).catch ((e: any) => {
         
            props.onFluidError (e? e.toString() : EUIStrings.kJoinApiError + " :" + conversationKey.toString() + ".");
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

   function onExitConversation () : void {

      let query = JoinDetails.toString ("", "", props.sessionKey, new ConversationKey(""));
      location.replace (EConfigStrings.kHomeRelativeUrl + '#' + query);   
      location.reload();    
   }

   function onTrimConversation () : void {

      throwIfUndefined (fluidConnection);
      let fluidMessagesConnection : MessageBotFluidConnection = fluidConnection;      
      fluidMessagesConnection.resetMessages ();  
      refreshAfterTrim ();        
   }

   function onDislikeUrl (url_: string) : void {
      
      let keyGenerator = getDefaultKeyGenerator();

      let repository = getRecordRepository(props.sessionKey);
      let email = props.localPersona.email;
      let record = new LikeDislikeActivityRecord (keyGenerator.generateKey(), 
         props.conversationKey.toString(),
         email, new Date(), url_, false);
      repository.save (record);                                                            
   }

   function onLikeUrl (url_: string) : void {
      
      let keyGenerator = getDefaultKeyGenerator();

      let repository = getRecordRepository(props.sessionKey);
      let email = props.localPersona.email;
      let record = new LikeDislikeActivityRecord (keyGenerator.generateKey(), 
         props.conversationKey.toString(),
         email, new Date(), url_, true);
      repository.save (record); 

      onPostiveUseOfUrl (url_);                                                            
   }

   function onClickUrl (url_: string) : void {
      
      let keyGenerator = getDefaultKeyGenerator();

      let repository = getRecordRepository(props.sessionKey);
      let email = props.localPersona.email;
      let record = new UrlActivityRecord (keyGenerator.generateKey(), 
         props.conversationKey.toString(),
         email, new Date(), url_);
      repository.save (record); 

      onPostiveUseOfUrl (url_);                                                            
   }

   function onPostiveUseOfUrl (url_: string) : void {
      
      let embeddingRespository = getEmbeddingRepository (props.sessionKey);

      // Get the summary of the URL the user clocked on
      let summary = embeddingRespository.lookupUrlSummary (url_);
      summary.then ((summaryText: string) => {

         let connectionPromise = AIConnector.connect (props.sessionKey);
      
         // Connext to the LLM
         connectionPromise.then ( (connection : AIConnection) => { 

            // Ask the LLM for a question based on the summary            
            connection.makeFollowUpCall (summaryText).then ((result_: Message) => {                                                                               
               if (result_) {
                  result_.authorId = props.localPersona.id;
                  setSuggested (result_);
               }
            });
         });  
      });                                                                
   }

   function onAddSuggestedContent () {

      throwIfUndefined (fluidConnection);
      let fluidMessagesConnection : MessageBotFluidConnection = fluidConnection;

      throwIfUndefined (suggested);      
      suggested.sentAt = new Date(); // Need to reset date so it goes at the end. 

      if (suggested.chunks && suggested.chunks.length > 0) {
         // If we have attached chucks, its a full message that we just replay
         addMessage (fluidMessagesConnection, suggested); 
      }
      else {
         // Else its is text, so we play it as a message that makes a request to the LLM, which sends all the context with it to the LLM
         let fullMessage = EConfigStrings.kLLMRequestSignature + " " + suggested.text;
         onSend (fullMessage);
      }

      setSuggested (undefined);
   }

   function onCancelSuggestedContent () {
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
      
      // Save it to the DB - async
      let keyGenerator = getDefaultKeyGenerator();      
      let repository = getRecordRepository(props.sessionKey);
      let email = props.localPersona.email;
      let record = new MessageActivityRecord (keyGenerator.generateKey(), 
         props.conversationKey.toString(),
         email, new Date(), messageText_);
      repository.save (record);       

      // Save state and force a refresh
      let messageArray = fluidMessagesConnection.messageCaucus().currentAsArray();      
      setConversation (messageArray);      
      let audienceMap = fluidMessagesConnection.participantCaucus().current();
      setAudience (audienceMap);

      // If LLM is being invoked we make a call here 
      // ======================================================
      if (AIConnection.isRequestForLLM (message, audienceMap)) {

         setIsBusy(true);

         let connectionPromise = AIConnector.connect (props.sessionKey);

         connectionPromise.then ( (connection : AIConnection) => {

            let query = connection.buildDirectQuery (messageArray, audienceMap);

            connection.makeEnrichedCall (message.id, query).then ((result_: Message) => {
               
               // Push it to shared data
               addMessage (fluidMessagesConnection, result_);

               setIsBusy(false);                         

            }).catch ( (e: any) => {
               
               props.onAiError (EUIStrings.kAiApiError);
               setIsBusy(false);                
            });            

         }).catch ( (e: any) => {
            props.onAiError (EUIStrings.kJoinApiError + " :" + props.sessionKey.toString() + ".");
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

   if (! joinValidator.isJoinAttemptReady (props.localPersona.email, props.localPersona.name, 
                                           props.sessionKey, props.conversationKey)) {
      return (<div></div>);
   }
   else
      return (
         <ConversationRow 
             isConnected={props.sessionKey.looksValidSessionKey() && conversationKey.looksValidConversationKey()}
             isBusy = {isBusy}
             sessionKey={props.sessionKey}
             conversationKey={conversationKey}
             conversation={conversation}
             audience={audience} 
             hasSuggestedContent={suggested ? true: false}
             suggestedContent={suggested ? suggested.text: ""}
             onSend={onSend} 
             onAddSuggestedContent={onAddSuggestedContent}
             onCancelSuggestedContent={onCancelSuggestedContent}
             onTrimConversation={onTrimConversation}
             onExitConversation={onExitConversation}             
             onClickUrl={onClickUrl}
             onLikeUrl={onLikeUrl}    
             onDislikeUrl={onDislikeUrl}                      
             >
         </ConversationRow>
      );
}

