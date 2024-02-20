'use strict';
// Copyright Braid Technologies ltd, 2024
import { throwIfUndefined } from '../core/Asserts';
import { Message} from '../core/Message';
import { Persona} from '../core/Persona';
import { EIcon } from '../core/Icons';
import { EConfigStrings, KStubEnvironmentVariables} from '../core/ConfigStrings'; 
import { EEnvironment, Environment } from '../core/Environment';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { AiConnection, AiConnector } from '../core/AIConnection';

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

describe("AIConnection", function () {

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

      expect(AiConnection.isBotMessage(botMessage, authors)).toEqual(true);
      expect(AiConnection.isBotMessage(personMessage, authors)).toEqual(false); 
      expect(AiConnection.isBotMessage(botRequest, authors)).toEqual(false);           
   });

   it("Needs to detect Bot request type", function () {

      expect(AiConnection.isBotRequest(personMessage, authors)).toEqual(false);   
      expect(AiConnection.isBotRequest(botMessage, authors)).toEqual(false);     
      expect(AiConnection.isBotRequest(botRequest, authors)).toEqual(true);          
   });   

   it("Needs to detect reference errors", function () {

      var newMessage = new Message(personMessage);
      newMessage.authorId = "Banana";
  
      let caught = false;

      try {
         AiConnection.isBotMessage(newMessage, authors);
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

      let query = AiConnection.makeOpenAiQuery (messages, authors);

      expect(query.length).toEqual(3);         
   });    
   
   it("Needs to generate valid response from Open AI web endpoint", async function () {

      let messages = new Array<Message>();
      messages.length = 3;
      messages[0] = personMessage;
      messages[1] = botRequest;
      messages[2] = botMessage;

      let fullQuery = AiConnection.makeOpenAiQuery (messages, authors);

      throwIfUndefined(process);
      throwIfUndefined(process.env);
      throwIfUndefined(process.env.OPENAI_API_KEY);        
      let caller = new AiConnection(process.env.OPENAI_API_KEY);

      let result = await caller.queryAI (botRequest.text, fullQuery);

      expect (result.message.length > 0).toBe(true);
   });   
});


describe("AIConnector", function () {

   it("Needs to connect to valid stub API", async function () {

      let caught = false;
      try {
         let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);
      }
      catch (e) {
         caught = true;
      }
      expect(caught).toEqual(false);         
   });    
   
   it("Needs to return a connection on successful communication with real back end", async function () {

      let caught = false;
      
      // Force use of actual API calls rather than local stubs
      let oldEnv = Environment.override (EEnvironment.kProduction);

      try {
         let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);
      }
      catch (err) {
         caught = true;
      }
      Environment.override (oldEnv);          

      expect(caught).toEqual(false);      

   }).timeout (5000);    

   it("Needs to detect error on failure to connect to back end", async function () {

      let caught = false;
      
      // Force use of actual API calls rather than local stubs
      let oldEnv = Environment.override (EEnvironment.kProduction);

      try {
         let connection = await AiConnector.connect ("thiswillfail");
      }
      catch (err) {
         caught = true;
      }
      Environment.override (oldEnv);          

      expect(caught).toEqual(true);    

   }).timeout (5000);   

});