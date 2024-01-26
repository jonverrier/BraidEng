/*! Copyright Braid Technologies 2022 */
// The ConversationController manages the interaction with the shared data structures, and drives a ConversationView
// ConversationPage is largely a passive view, although it does notify the controller if the local users adds a message.

// React
import React, { useState } from 'react';


import { EUIStrings } from './UIStrings';
import { EConfigStrings } from './ConfigStrings';
import { EIcon } from '../core/Icons';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { Persona } from '../core//Persona';
import { Message } from '../core/Message';
import { ConversationPage } from './ConversationPage';

export interface IConversationControllerProps {

   conversationKey: string;
   localPersona: Persona; 
}

// create a forceUpdate hook
// https://stackoverflow.com/questions/46240647/how-to-force-a-functional-react-component-to-render
function useForceUpdate() {
   const [value, setValue] = useState(0); // simple integer state
   return () => setValue(value => value + 1); // update state to force render
}

export const ConversationController = (props: IConversationControllerProps) => {

   const [conversation, setConversation] = useState<Array<Message>>(new Array<Message>());
   const [audience, setAudience] = useState<Map<string, Persona>>(new Map<string, Persona>());


   // TEMP ***
   if (conversation.length === 0) {

      let keyGenerator = new UuidKeyGenerator();
      let person = new Persona (keyGenerator.generateKey(), "Jon", EIcon.kPersonPersona, undefined, new Date());
      let bot = new Persona (keyGenerator.generateKey(), "Braid Bot", EIcon.kBotPersona, undefined, new Date());  
   
      let personMessage = new Message (keyGenerator.generateKey(), person.id, undefined, "Hello, from a person.", new Date());
      let botMessage = new Message (keyGenerator.generateKey(), bot.id, undefined, "Hello, from the braid bot.", new Date());
      let replaceMessage = new Message (keyGenerator.generateKey(), person.id, undefined, "Will change.", new Date());   

      conversation.push (personMessage);
      conversation.push (botMessage);  
      conversation.push (replaceMessage);

      audience.set (person.id, person);
      audience.set (bot.id, bot);
   }
   // TEMP ***

   audience.set (props.localPersona.id, props.localPersona);
   
   // call the force update hook 
   const forceUpdate = useForceUpdate();   

   function onSend (messageText_: string) : void {

      // set up a message to append
      let message = new Message ();
      message.authorId = props.localPersona.id;
      message.text = messageText_;
      message.sentAt = new Date();
      conversation.push (message);

      // Save state and force a refresh
      setConversation(conversation);
      forceUpdate ();      
   }

   return (
         <ConversationPage 
             isConnected={props.conversationKey.length > 0}
             conversation={conversation}
             audience={audience} 
             onSend={onSend} >
         </ConversationPage>
      );
}

