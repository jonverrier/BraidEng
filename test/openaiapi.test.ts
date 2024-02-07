'use strict';
// Copyright Braid Technologies ltd, 2021
import { throwIfUndefined } from '../core/Asserts';
import { Message} from '../core/Message';
import { Persona} from '../core/Persona';
import { EIcon } from '../core/Icons';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { OpenAiAPi, OpenAiCaller } from '../core/OpenAiAPi';

import { expect } from 'expect';
import { describe, it } from 'mocha';

import axios from "axios";

let keyGenerator: IKeyGenerator = new UuidKeyGenerator();

let myMessageId: string = "1234";
let myAuthorId: string = "Jon";
let myText = "Please help me understand the difference between investing in a unit trust and investing in an equity in less than 50 words.";
let mySentAt = new Date();

let botMessageId: string = "5678";
let botAuthorId: string = "Bot";
let botText = "Bye";
var botSentAt = new Date(0);

let myBotRequestId: string = "12345";
let myBotRequestText = "Hello @BraidBot Please help me understand the difference between investing in a unit trust and investing in an equity in less than 50 words.";

describe("OpenAiApi", function () {

   let authors = new Map<string, Persona> ();
   let person = new Persona (myAuthorId, myAuthorId, EIcon.kPersonPersona, undefined, new Date());   
   let bot = new Persona (botAuthorId, botAuthorId, EIcon.kBotPersona, undefined, new Date());
   authors.set (person.id, person);
   authors.set (bot.id, bot);

   let personMessage = new Message(myMessageId, myAuthorId, undefined, myText, mySentAt);

   let botMessage = new Message(botMessageId, botAuthorId, undefined, botText, botSentAt);

   let botRequest = new Message(myBotRequestId, myAuthorId, undefined, myBotRequestText, mySentAt); 

   this.timeout(10000);

   beforeEach(async () => {

      this.timeout(10000);
   });

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

      let query = OpenAiAPi.makeOpenAiQuery (messages, authors);

      expect(query.length).toEqual(3);         
   });    
   
   it("Needs to generate valid response from Open AI web endpoint", async function () {

      let messages = new Array<Message>();
      messages.length = 3;
      messages[0] = personMessage;
      messages[1] = botRequest;
      messages[2] = botMessage;

      let query = OpenAiAPi.makeOpenAiQuery (messages, authors);

      let caller = new OpenAiCaller();

      throwIfUndefined(process);
      throwIfUndefined(process.env);
      throwIfUndefined(process.env.OPENAI_API_KEY);      
      let result = await caller.callAI (query, process.env.OPENAI_API_KEY);

      console.log (result);

      expect (result.length > 0).toBe(true);

      /*
      axios.post('https://api.openai.com/v1/chat/completions', {
         messages: query,
         model: "gpt-3.5-turbo",
      },
      {
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
      })
      .then((response : any) => {
         console.log(response.data.choices[0].message.content);
      })
      .catch((error: any) => {
         console.error(error);
      });
      */
   });   
});


