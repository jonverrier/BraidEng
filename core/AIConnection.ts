// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

// Other 3rd party imports
import { tag, LogLevel } from 'missionlog';

// Local
import { Message } from './Message';
import { Persona } from './Persona';
import { EIcon } from './Icons';
import { EConfigStrings } from './ConfigStrings';
import { throwIfUndefined } from './Asserts';
import { ConnectionError, AssertionFailedError } from "./Errors";
import { KeyRetriever } from "./KeyRetriever";
import { Environment, EEnvironment } from "./Environment";
import { KnowledgeEnrichedMessage, KnowledgeRepository, kDefaultKnowledgeSegmentCount, kDefaultMinimumCosineSimilarity} from "./Knowledge";

// Logging handler
const logger = {
   [LogLevel.ERROR]: (tag, msg, params) => console.error(msg, ...params),
   [LogLevel.WARN]: (tag, msg, params) => console.warn(msg, ...params),
   [LogLevel.INFO]: (tag, msg, params) => console.log(msg, ...params),
   [LogLevel.TRACE]: (tag, msg, params) => console.log(msg, ...params),
   [LogLevel.DEBUG]: (tag, msg, params) => console.log(msg, ...params),
} as Record<LogLevel, (tag: string, msg: unknown, params: unknown[]) => void>;

// Actual is 2048, but leave some headroom
const kMaxTokens : number= 1536;

export class AIConnection {

   private _activeCallCount: number;
   private _key: string;   

   /**
    * Create an AIConnection object 
    */
   constructor(key_: string) {

      this._activeCallCount = 0;
      this._key = key_
   }  

   // Makes an Axios call to call web endpoint
   async queryAI  (mostRecent: string, allMessages: Array<Object>) : Promise<KnowledgeEnrichedMessage> {
      
      this._activeCallCount++;

      var response : any = null;

      await axios.post('https://api.openai.com/v1/chat/completions', {
         messages: allMessages,
         model: "gpt-3.5-turbo",
      },
      {
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this._key}`
         }
      })
      .then((resp : any) => {

         response = resp;
         this._activeCallCount--;         
      })
      .catch((error: any) => {

         this._activeCallCount--;     

         logger.ERROR (EConfigStrings.kApiLogCategory, EConfigStrings.kErrorConnectingToAiAPI, [error]);
      });

      if (!response)
         throw new ConnectionError(EConfigStrings.kErrorConnectingToAiAPI);      

      let embedding = await this.createEmbedding (mostRecent);

      let enriched = KnowledgeRepository.lookUpMostSimilar (embedding, kDefaultMinimumCosineSimilarity, kDefaultKnowledgeSegmentCount);

      return new KnowledgeEnrichedMessage (response.data.choices[0].message.content as string, enriched.sources);
   }    

      // Makes an Axios call to call web endpoint
   async createEmbedding  (input: string) : Promise<Array<number>> {
      
      this._activeCallCount++;
   
      var response : any = null;
   
      await axios.post('https://api.openai.com/v1/embeddings', {
         input: input,
         model: "text-embedding-ada-002",
      },
      {
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this._key}`
         }
      })
      .then((resp : any) => {
   
         response = resp;
         this._activeCallCount--;         
      })
         .catch((error: any) => {
   
         this._activeCallCount--;     
   
         logger.ERROR (EConfigStrings.kApiLogCategory, EConfigStrings.kErrorConnectingToAiAPI, [error]);
      });
   
      if (!response)
         throw new ConnectionError(EConfigStrings.kErrorConnectingToAiAPI);      

      return response.data.data[0].embedding as Array<number>;
   } 

   isBusy () {
      return this._activeCallCount !== 0;
   }

   static findEarliestMessageIndexWithinTokenLimit (messages: Array<Message>, authors: Map<string, Persona>) : number {

      if (messages.length == 0)      
         throw new AssertionFailedError ("Message array is zero length.");
      if (messages.length == 1)
         return 0;

      let tokenAccumulator = 0;
      let iLowest = 0;

      for (let i = messages.length - 1; i >= 0 && tokenAccumulator < kMaxTokens; i--) {

         tokenAccumulator += messages[i].tokens;

         console.log ("i is" + i +", tokens are " + tokenAccumulator);

         if (tokenAccumulator < kMaxTokens)
            iLowest = i;
      }      
      return iLowest;
   }

   static makeOpenAIQuery (messages: Array<Message>, authors: Map<string, Persona>): Array<Object> {

      let builtQuery = new Array<Object> ();

      let prompt = { role: 'system', content: EConfigStrings.kOpenAiPersonaPrompt };
      builtQuery.push (prompt);      

      var start = AIConnection.findEarliestMessageIndexWithinTokenLimit(messages, authors);

      for (let i = start; i < messages.length; i++) {

         let message = messages[i];

         if (AIConnection.isBotRequest(message, authors)) {

            let edited = message.text.replace (EConfigStrings.kBotRequestSignature, "");
            let entry = { role: 'user', content: edited };
            builtQuery.push (entry);
         }

         if (AIConnection.isBotMessage(message, authors)) {
            
            let entry = { role: 'assistant', content: message.text };
            builtQuery.push (entry);     

            for (let j = 0; j < message.segments.length; j++) {
               let entry = { role: 'assistant', content: message.segments[j].summary };
               builtQuery.push (entry);
            }                   
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

      return (author.icon === EIcon.kPersonPersona) && 
      (message.text.includes (EConfigStrings.kBotRequestSignature) || message.text.includes (EConfigStrings.kBotRequestSignatureLowerCase));
   }

}

export class AIConnector {
   
   static async connect (joinKey_: string) : Promise<AIConnection> {

      let retriever = new KeyRetriever ();
      var url: string;

      if (Environment.environment() === EEnvironment.kLocal)
         url = EConfigStrings.kRequestLocalAiKeyUrl;
      else
         url = EConfigStrings.kRequestAiKeyUrl;

      let aiKey = await retriever.requestKey (url, 
                                       EConfigStrings.kRequestKeyParameterName, 
                                       joinKey_);

      return new AIConnection (aiKey);
   }
}