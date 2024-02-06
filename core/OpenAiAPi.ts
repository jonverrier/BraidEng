// Copyright (c) 2024 Braid Technologies Ltd

import { Message } from './Message';
import { Persona } from './Persona';
import { EIcon } from './Icons';
import { EConfigStrings } from './ConfigStrings';
import { throwIfUndefined } from './Asserts';

export class OpenAiAPi {

   static makeOpenAiQuery (messages: Array<Message>, authors: Map<string, Persona>): Array<Object> {

      let builtQuery = new Array<Object> ();

      let prompt = { role: 'system', content: EConfigStrings.kOpenAiPersonaPrompt };
      builtQuery.push (prompt);      

      for (const message of messages) {
         if (OpenAiAPi.isBotRequest(message, authors)) {
            let entry = { role: 'user', content: message.text };
            builtQuery.push (entry);
         }

         if (OpenAiAPi.isBotMessage(message, authors)) {
            let entry = { role: 'assistant', content: message.text };
            builtQuery.push (entry);
         }         

      }
      return builtQuery; 
   }

   static isBotMessage (message: Message, authors: Map<string, Persona>) : boolean {

      let author = authors.get (message.authorId);

      throwIfUndefined (author);

      return (author.icon === EIcon.kBotPersona);
   }

 static isBotRequest (message: Message, authors: Map<string, Persona>) : boolean {

    let author = authors.get (message.authorId);

    throwIfUndefined (author);

    return (author.icon === EIcon.kPersonPersona) && (message.text.includes (EConfigStrings.kBotRequestSignature));
 }

}