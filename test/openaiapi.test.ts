'use strict';
// Copyright Braid Technologies ltd, 2021
import { Message} from '../core/Message';
import { Persona} from '../core/Persona';
import { EIcon } from '../core/Icons';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { OpenAiAPi } from '../core/OpenAiAPi';

import { expect } from 'expect';
import { describe, it } from 'mocha';

let keyGenerator: IKeyGenerator = new UuidKeyGenerator();

let myMessageId: string = "1234";
let myAuthorId: string = "Jon";
let myText = "Hello";
let mySentAt = new Date();

let botMessageId: string = "5678";
let botAuthorId: string = "Bot";
let botText = "Bye";
var botSentAt = new Date(0);

let myBotRequestId: string = "12345";
let myBotRequestText = "Hello @BraidBot";

describe("OpenAiApi", function () {

   let authors = new Map<string, Persona> ();
   let person = new Persona (myAuthorId, myAuthorId, EIcon.kPersonPersona, undefined, new Date());   
   let bot = new Persona (botAuthorId, botAuthorId, EIcon.kBotPersona, undefined, new Date());
   authors.set (person.id, person);
   authors.set (bot.id, bot);

   let personMessage = new Message(myMessageId, myAuthorId, undefined, myText, mySentAt);

   let botMessage = new Message(botMessageId, botAuthorId, undefined, botText, botSentAt);

   let botRequest = new Message(myBotRequestId, myAuthorId, undefined, myBotRequestText, mySentAt); 

   it("Needs to detect Bot message type", function () {

      var messageEmpty = new Message();

      expect(OpenAiAPi.isBotMessage(botMessage, authors)).toEqual(true);
      expect(OpenAiAPi.isBotMessage(personMessage, authors)).toEqual(false); 
      expect(OpenAiAPi.isBotMessage(botRequest, authors)).toEqual(false);           
   });

   it("Needs to detect Bot request type", function () {

      expect(OpenAiAPi.isBotRequest(personMessage, authors)).toEqual(false);   
      expect(OpenAiAPi.isBotRequest(botMessage, authors)).toEqual(false);     
      expect(OpenAiAPi.isBotRequest(botRequest, authors)).toEqual(true);          
   });   

   it("Needs to detect reference errors", function () {

      var newMessage = new Message(personMessage);
      newMessage.authorId = "Banana";
  
      let caught = false;

      try {
         OpenAiAPi.isBotMessage(newMessage, authors);
      }
      catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);         
   });   

   it("Needs to build request object", function () {

      let messages = new Array<Message>();
      messages.length = 3;
      messages[0] = personMessage;
      messages[1] = botRequest;
      messages[2] = botMessage;

      let resp = OpenAiAPi.makeOpenAiQuery (messages, authors);

      console.log (resp);

      expect(messages.length).toEqual(3);         
   });      
});
