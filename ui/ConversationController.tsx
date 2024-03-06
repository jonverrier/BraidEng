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
import { JoinKey } from '../core/JoinKey';
import { JoinPageValidator } from '../core/JoinPageValidator';
import { ConversationRow } from './ConversationRow';
import { MessageBotFluidConnection } from '../core/MessageBotFluidConnection';
import { Interest, NotificationFor, NotificationRouterFor, ObserverInterest } from '../core/NotificationFramework';
import { AiConnection, AiConnector } from '../core/AIConnection';
import { EUIStrings } from './UIStrings';
import { EConfigStrings } from '../core/ConfigStrings';
import { KnowledgeEnrichedMessage } from '../core/Knowledge';

export interface IConversationControllerProps {

   joinKey: JoinKey;
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
   const [fullJoinKey, setFullJoinKey] = useState<JoinKey> (props.joinKey);
   const [isBusy, setIsBusy] = useState<boolean>(false);

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
      
      setFullJoinKey (JoinKey.makeFromTwoParts (props.joinKey.firstPart, containerId));      
   }

   let validater = new JoinPageValidator();

   if (validater.isJoinAttemptReady (props.localPersona.name, props.joinKey) && 
      fluidConnection === undefined 
      && !joining) {

      setJoining(true);

      let joinKey = props.joinKey;

      let fluidMessagesConnection = new MessageBotFluidConnection ( {}, props.localPersona);
      
      if (joinKey.isSinglePart) {

         fluidMessagesConnection.createNew (joinKey.firstPart).then (containerId => {
        
            initialiseConnectionState (fluidMessagesConnection, containerId);
            setJoining (false);

         }).catch ((e : any) => {
         
            props.onFluidError (e? e.toString() : "Error creating new conversation, " + joinKey.secondPart + ".");
            setJoining (false);
         })
      }
      else if (joinKey.isTwoPart) {

         fluidMessagesConnection.attachToExisting (joinKey.firstPart, joinKey.secondPart).then (containerId => {

            initialiseConnectionState (fluidMessagesConnection, joinKey.secondPart);
         
            setJoining (false);

         }).catch ((e: any) => {
         
            props.onFluidError (e? e.toString() : EUIStrings.kJoinApiError + " :" + joinKey.secondPart + ".");
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

      // Save state and force a refresh
      let messageArray = fluidMessagesConnection.messageCaucus().currentAsArray();      
      setConversation (messageArray);      
      let audienceMap = fluidMessagesConnection.participantCaucus().current();
      setAudience (audienceMap);

      // If AI is being invoked we make a call here 
      // ======================================================
      if (AiConnection.isBotRequest (message, audienceMap)) {

         setIsBusy(true);

         let connectionPromise = AiConnector.connect (props.joinKey.firstPart);

         connectionPromise.then ( (connection : AiConnection) => {

            let query = AiConnection.makeOpenAiQuery (messageArray, audienceMap);

            connection.queryAI (messageText_, query).then ((result_: KnowledgeEnrichedMessage) => {
               
               // set up a message to append
               let message = new Message ();
               message.authorId = EConfigStrings.kBotGuid;
               message.text = result_.message;
               message.sentAt = new Date();
               message.sources = result_.sources; // Add KnowledgeSources

               // Push it to shared data
               fluidMessagesConnection.messageCaucus().add (message.id, message);

               // Save state and force a refresh
               let messageArray = fluidMessagesConnection.messageCaucus().currentAsArray();      
               setConversation (messageArray); 
               setIsBusy(false);               
               forceUpdate ();                

            }).catch ( (e: any) => {
               
               props.onAiError (EUIStrings.kAiApiError);
               setIsBusy(false);                
            });            

         }).catch ( (e: any) => {
            props.onAiError (EUIStrings.kJoinApiError + " :" + props.joinKey.firstPart + ".");
            setIsBusy(false);             
         });
      }

      forceUpdate ();      
   }

   let joinValidator = new JoinPageValidator ();

   if (! joinValidator.isJoinAttemptReady (props.localPersona.name, props.joinKey)) {
      return (<div></div>);
   }
   else
      return (
         <ConversationRow 
             isConnected={fullJoinKey.isValid && fullJoinKey.isTwoPart}
             isBusy = {isBusy}
             joinKey={fullJoinKey}
             conversation={conversation}
             audience={audience} 
             onSend={onSend} 
             onTrimConversation={onTrimConversation}>
         </ConversationRow>
      );
}

