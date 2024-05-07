// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

// Local
import { logApiError } from "./Logging";
import { Message } from './Message';
import { Persona } from './Persona';
import { EIcon } from './Icons';
import { EConfigStrings } from './ConfigStrings';
import { throwIfUndefined } from './Asserts';
import { ConnectionError, AssertionFailedError } from "./Errors";
import { KeyRetriever } from "./KeyRetriever";
import { Environment, EEnvironment } from "./Environment";
import { KnowledgeEnrichedMessage, KnowledgeRepository, kDefaultKnowledgeSegmentCount, kDefaultMinimumCosineSimilarity} from "./Knowledge";
import { SessionKey } from "./Keys";

// We allow for the equivalent of 10 minutes of chat. 10 mins * 60 words = 600 words = 2400 tokens. 
const kMaxTokens : number= 4096;

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

      // OPENAI POST ('https://api.openai.com/v1/chat/completions', {
      // AZURE POST https://{your-resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions?api-version={api-version}

      await axios.post('https://braidlms.openai.azure.com/openai/deployments/braidlms/chat/completions?api-version=2024-02-01', {
         messages: allMessages,
         // OPENAI model: "gpt-3.5-turbo"
         // OPENAI prompt: allMessages
      },
      {
         headers: {
            'Content-Type': 'application/json',
            // OpenAI - 'Authorization': `Bearer ${this._key}`
            'api-key': this._key
         }
      })
      .then((resp : any) => {

         response = resp;
         this._activeCallCount--;         
      })
      .catch((error: any) => {

         this._activeCallCount--;     

         logApiError (EConfigStrings.kErrorConnectingToAiAPI, error);
      });

      if (!response)
         throw new ConnectionError(EConfigStrings.kErrorConnectingToAiAPI);      

      let embedding = await this.createEmbedding (mostRecent);

      let enriched = KnowledgeRepository.lookUpMostSimilar (embedding, kDefaultMinimumCosineSimilarity, kDefaultKnowledgeSegmentCount);

      return new KnowledgeEnrichedMessage (response.data.choices[0].message.content as string, enriched.chunks);
   }    

      // Makes an Axios call to call web endpoint
   async createEmbedding  (input: string) : Promise<Array<number>> {
      
      this._activeCallCount++;
   
      var response : any = null;
   
      // AZURE POST https://{your-resource-name}.openai.azure.com/openai/deployments/{deployment-id}/embeddings?api-version={api-version}
      // OPENAI POST 'https://api.openai.com/v1/embeddings'

      await axios.post('https://braidlms.openai.azure.com/openai/deployments/braidlmse/embeddings?api-version=2024-02-01', {
         input: input,
         // OPENAI model: "text-embedding-ada-002",       
      },
      {
         headers: {
            'Content-Type': 'application/json',
            // OpenAI - 'Authorization': `Bearer ${this._key}`
            'api-key': this._key           
         }
      })
      .then((resp : any) => {
   
         response = resp;
         this._activeCallCount--;         
      })
      .catch((error: any) => {
   
         this._activeCallCount--;     
   
         logApiError (EConfigStrings.kErrorConnectingToAiAPI, error);
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

         if (AIConnection.isRequestForLLM(message, authors)) {

            let edited = message.text.replace (EConfigStrings.kLLMRequestSignature, "");
            let entry = { role: 'user', content: edited };
            builtQuery.push (entry);
         }

         if (AIConnection.isFromLLM(message, authors)) {
            
            let entry = { role: 'assistant', content: message.text };
            builtQuery.push (entry);     

            for (let j = 0; j < message.chunks.length; j++) {
               let entry = { role: 'assistant', content: message.chunks[j].summary };
               builtQuery.push (entry);
            }                   
         }         

      }
      return builtQuery; 
   }

   /**
    * is a message from the LLM - look at the author ID
    */
   static isFromLLM (message: Message, authors: Map<string, Persona>) : boolean {

      let author = authors.get (message.authorId);

      throwIfUndefined (author);

      return (author.icon === EIcon.kLLMPersona);
   }


   /**
    * is a message invoking the LLM - look at the author, and if the message contains the LLM name 
    */
      static isRequestForLLM (message: Message, authors: Map<string, Persona>) : boolean {

      let author = authors.get (message.authorId);
      throwIfUndefined (author);

      return (author.icon === EIcon.kPersonPersona) && 
      (message.text.includes (EConfigStrings.kLLMRequestSignature) || message.text.includes (EConfigStrings.kLLMRequestSignatureLowerCase));
   }

  /**
    * is a message an attempt to invoke the LLM - look at the author, and if the message contains miss-spellings of LLM name 
    */
      static mightBeMissTypedRequestForLLM (message: Message, authors: Map<string, Persona>) : boolean {

      if (AIConnection.isRequestForLLM (message, authors))
         return false;

      let author = authors.get (message.authorId);
      throwIfUndefined (author);

      return (author.icon === EIcon.kPersonPersona) && 
         (message.text.includes (EConfigStrings.kLLMNearRequestSignature) || message.text.includes (EConfigStrings.kLLMNearRequestSignatureLowerCase));
   }   

}

export class AIConnector {
   
   static async connect (sessionKey_: SessionKey) : Promise<AIConnection> {

      let retriever = new KeyRetriever ();
      var url: string;

      if (Environment.environment() === EEnvironment.kLocal)
         url = EConfigStrings.kRequestLocalAiKeyUrl;
      else
         url = EConfigStrings.kRequestAiKeyUrl;

      let aiKey = await retriever.requestKey (url, 
                                       EConfigStrings.kSessionParamName, 
                                       sessionKey_);

      return new AIConnection (aiKey);
   }
}