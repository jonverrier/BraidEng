'use strict';
// Copyright Braid Technologies ltd, 2024
import { throwIfUndefined } from '../core/Asserts';
import { Message} from '../core/Message';
import { KnowledgeSegment } from '../core/Knowledge';
import { Persona} from '../core/Persona';
import { EIcon } from '../core/Icons';
import { KStubEnvironmentVariables} from '../core/ConfigStrings'; 
import { EEnvironment, Environment } from '../core/Environment';
import { AIConnection, AIConnector } from '../core/AIConnection';

import { expect } from 'expect';
import { describe, it } from 'mocha';

let myMessageId: string = "1234";
let myAuthorId: string = "Jon";
let myText = "Braid What is back propagation?";
let mySentAt = new Date();

let botMessageId: string = "5678";
let botAuthorId: string = "Bot";
let botText = "Bye";
var botSentAt = new Date(0);

let myBotRequestId: string = "12345";
let myBotRequestText = "Hello @Braid What is back propagation?";

describe("AIConnection", function () {

   let authors = new Map<string, Persona> ();
   let person = new Persona (myAuthorId, myAuthorId, EIcon.kPersonPersona, undefined, new Date());   
   let bot = new Persona (botAuthorId, botAuthorId, EIcon.kLLMPersona, undefined, new Date());
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

      expect(AIConnection.isFromLLM(botMessage, authors)).toEqual(true);
      expect(AIConnection.isFromLLM(personMessage, authors)).toEqual(false); 
      expect(AIConnection.isFromLLM(botRequest, authors)).toEqual(false);           
   });

   it("Needs to detect Bot request type", function () {

      expect(AIConnection.isRequestForLLM(personMessage, authors)).toEqual(false);   
      expect(AIConnection.isRequestForLLM(botMessage, authors)).toEqual(false);     
      expect(AIConnection.isRequestForLLM(botRequest, authors)).toEqual(true);          
   });   

   it("Needs to detect near-miss Bot request type", function () {

      expect(AIConnection.mightBeMissTypedRequestForLLM (personMessage, authors)).toEqual(true);   
      expect(AIConnection.mightBeMissTypedRequestForLLM(botMessage, authors)).toEqual(false);
      expect(AIConnection.mightBeMissTypedRequestForLLM(botRequest, authors)).toEqual(false);                 
   });   

   it("Needs to detect reference errors", function () {

      var newMessage = new Message(personMessage);
      newMessage.authorId = "Banana";
  
      let caught = false;

      try {
         AIConnection.isFromLLM(newMessage, authors);
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

      let query = AIConnection.makeOpenAIQuery (messages, authors);

      expect(query.length).toEqual(3);         
   });    
   
   it("Needs to generate valid response from Open AI web endpoint", async function () {

      let messages = new Array<Message>();
      messages.length = 3;
      messages[0] = personMessage;
      messages[1] = botRequest;
      messages[2] = botMessage;

      let fullQuery = AIConnection.makeOpenAIQuery (messages, authors);

      throwIfUndefined(process);
      throwIfUndefined(process.env);
      throwIfUndefined(process.env.OPENAI_API_KEY);        
      let caller = new AIConnection(process.env.OPENAI_API_KEY);

      let result = await caller.queryAI (botRequest.text, fullQuery);

      expect (result.message.length > 0).toBe(true);
   });   

   function makeLongMessage (startingMessage: Message, segmentCount: number) : Message {

      let segments = new Array<KnowledgeSegment>();      

      // Make a list of knowledge sources, each with 500 tokens
      for (var i = 0; i < segmentCount; i++) {
         
         let accumulatedText = "Hi";

         for (var j = 0; j < 500; j++) {
            accumulatedText = accumulatedText.concat (" token");
         }
         let ks1 = new KnowledgeSegment("makeUpUrl", accumulatedText, new Array<number>(), undefined, undefined);
         segments.push (ks1);
      }
      
      let newBotRequest = new Message (startingMessage);
      newBotRequest.segments = segments;

      return newBotRequest;
   }
   it("Needs to detect when token limit is OK", function () {

      let messages = new Array<Message>();

      messages.length = 3;
      messages[0] = personMessage;
      messages[1] = botRequest;
      messages[2] = makeLongMessage (botMessage, 2);

      let query = AIConnection.makeOpenAIQuery (messages, authors);
      expect(query.length).toEqual(5);         
   });    

   it("Needs to detect when token limit overflows", function () {

      let messages = new Array<Message>();

      messages.length = 4;
      messages[0] = personMessage;
      messages[1] = botRequest;
      messages[2] = makeLongMessage (botMessage, 4);
      messages[3] = botRequest;      

      let query = AIConnection.makeOpenAIQuery (messages, authors);
      expect(query.length).toEqual(2);         
   });      
});


describe("AIConnector", function () {

   it("Needs to connect to valid stub API", async function () {

      let caught = false;
      try {
         let connection = await AIConnector.connect (KStubEnvironmentVariables.JoinKey);
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
         let connection = await AIConnector.connect (KStubEnvironmentVariables.JoinKey);
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
         let connection = await AIConnector.connect ("thiswillfail");
      }
      catch (err) {
         caught = true;
      }
      Environment.override (oldEnv);          

      expect(caught).toEqual(true);    

   }).timeout (5000);   

});