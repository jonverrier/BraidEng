// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

// Local
import { SessionKey } from "./Keys";
import { logApiError } from "./Logging";
import { Message } from './Message';
import { Persona } from './Persona';
import { EIcon } from './Icons';
import { EConfigStrings } from './ConfigStrings';
import { throwIfUndefined } from './Asserts';
import { ConnectionError, AssertionFailedError } from "./Errors";
import { KeyRetriever } from "./KeyRetriever";
import { Environment, EEnvironment } from "./Environment";
import { IEmbeddingRepository, kDefaultSearchChunkCount, kDefaultMinimumCosineSimilarity} from "./IEmbeddingRepository";
import { getEmbeddingRepository } from "./IEmbeddingRepositoryFactory";
import { getDefaultKeyGenerator } from "./IKeyGeneratorFactory";

// We allow for the equivalent of 10 minutes of chat. 10 mins * 60 words = 600 words = 2400 tokens. 
const kMaxTokens : number= 4096;

export class AIMessageElement {
   role: string;
   content: string;
}

export class AIConnection {

   private _activeCallCount: number;
   private _aiKey: string;  
   private _embeddings: IEmbeddingRepository;

   /**
    * Create an AIConnection object 
    */
   constructor(aiKey_: string, sessionKey_: SessionKey) {

      this._activeCallCount = 0;
      this._aiKey = aiKey_;
      this._embeddings = getEmbeddingRepository (sessionKey_);
   }  

   // Makes an Axios call to call web endpoint
   async makeEnrichedCall  (allMessages: Array<AIMessageElement>) : Promise<Message> {
      
      this._activeCallCount++;

      var response : string = await this.makeSingleCall (allMessages); 

      if (!response)
         throw new ConnectionError(EConfigStrings.kErrorConnectingToAiAPI);      

      let embedding = await this.createEmbedding (allMessages[allMessages.length - 1].content);

      let enriched = await this._embeddings.lookupMostSimilar (embedding, undefined, kDefaultMinimumCosineSimilarity, kDefaultSearchChunkCount);

      let keyGenerator = getDefaultKeyGenerator();
      return new Message (keyGenerator.generateKey(), EConfigStrings.kLLMGuid, undefined, 
                          response, new Date(), enriched.chunks);
   }    

      // Makes an Axios call to call web endpoint
   async createEmbedding  (input: string) : Promise<Array<number>> {
      
      let self = this;
      self._activeCallCount++;
   
      let done = new Promise<Array<number>>(function(resolve, reject) {

         // AZURE POST https://{your-resource-name}.openai.azure.com/openai/deployments/{deployment-id}/embeddings?api-version={api-version}
         // OPENAI POST 'https://api.openai.com/v1/embeddings'

         axios.post('https://braidlms.openai.azure.com/openai/deployments/braidlmse/embeddings?api-version=2024-02-01', {
            input: input,
            // OPENAI model: "text-embedding-ada-002",       
         },
         {
            headers: {
               'Content-Type': 'application/json',
               // OpenAI - 'Authorization': `Bearer ${this._key}`
               'api-key': self._aiKey           
            }
         })
         .then((resp : any) => {
   
            self._activeCallCount--;               
            resolve (resp.data.data[0].embedding as Array<number>);      
         })
         .catch((error: any) => {
   
            self._activeCallCount--;     
            logApiError (EConfigStrings.kErrorConnectingToAiAPI, error);
            reject();
         });
      });

      return done;
   } 

   isBusy () {
      return this._activeCallCount !== 0;
   }

   buildQuery (messages: Array<Message>, authors: Map<string, Persona>): Array<AIMessageElement> {

      let builtQuery = new Array<AIMessageElement> ();

      let prompt = { role: 'system', content: EConfigStrings.kOpenAiPersonaPrompt };
      builtQuery.push (prompt);      

      var start = this.findEarliestMessageIndexWithinTokenLimit(messages, authors);

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

   // Makes an Axios call to call web endpoint
   private async makeSingleCall  (input: Array<AIMessageElement>) : Promise<string> {
      
      let self = this;
      self._activeCallCount++;

      let done = new Promise<string>(function(resolve, reject) {

         // OPENAI POST ('https://api.openai.com/v1/chat/completions', {
         // AZURE POST https://{your-resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions?api-version={api-version}

         axios.post('https://braidlms.openai.azure.com/openai/deployments/braidlms/chat/completions?api-version=2024-02-01', {
            messages: input,
            // OPENAI model: "gpt-3.5-turbo"
            // OPENAI prompt: allMessages
         },
         {
            headers: {
               'Content-Type': 'application/json',
               // OpenAI - 'Authorization': `Bearer ${this._key}`
               'api-key': self._aiKey
            }
         })
         .then((resp : any) => {
            
            self._activeCallCount--;   
            resolve (resp.data.choices[0].message.content);   
         })
         .catch((error: any) => {

            self._activeCallCount--;     

            logApiError (EConfigStrings.kErrorConnectingToAiAPI, error);
            reject();
         });
      });
   
      return done;
   }    

   private findEarliestMessageIndexWithinTokenLimit (messages: Array<Message>, authors: Map<string, Persona>) : number {

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

   /**
    * is a message from the LLM - look at the author ID
    */
   static isFromLLM (message: Message, authors: Map<string, Persona>) : boolean {

      let author = Persona.safeAuthorLookup (authors, message.authorId);
      throwIfUndefined (author);

      return (author.icon === EIcon.kLLMPersona);
   }


   /**
    * is a message invoking the LLM - look at the author, and if the message contains the LLM name 
    */
   static isRequestForLLM (message: Message, authors: Map<string, Persona>) : boolean {

      let author = Persona.safeAuthorLookup (authors, message.authorId);
      throwIfUndefined (author);

      return (author.icon === EIcon.kPersonPersona) && 
      (message.text.includes (EConfigStrings.kLLMRequestSignature) || message.text.includes (EConfigStrings.kLLMRequestSignatureLowerCase));
   }

  /**
    * is a message an attempt to invoke the LLM - look at the author, and if the message contains miss-spellings of LLM name 
    */
   static mightBeMissTypedRequestForLLM (message: Message, authors: Map<string, Persona>) : boolean {

      if (this.isRequestForLLM (message, authors))
         return false;

      let author = Persona.safeAuthorLookup (authors, message.authorId);
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

      return new AIConnection (aiKey, sessionKey_);
   }
}