// Copyright (c) 2024 Braid Technologies Ltd
 
import { MStreamable } from "./StreamingFramework";
import { areSameDate, areSameShallowArray, areSameDeepArray} from './Utilities';
import { LiteEmbedding, makeYouTubeUrl, makeGithubUrl } from "../core/EmbeddingFormats";
import liteYouTubeEmbeddings from '../core/youtube_embeddings_lite.json';
import liteMarkdownEmbeddings from '../core/markdown_embeddings_lite.json';
import { InvalidParameterError } from "./Errors";

function copyTimeStamp (stamp: Date | undefined) : Date | undefined {
   return (typeof stamp === 'undefined') ? undefined : new Date(stamp);
}
function copyRelevance (relevance: number | undefined) : number | undefined {
   return (typeof relevance === 'undefined') ? undefined : relevance;
}


/**
 * KnowledgeSource object
 * @param url - link to source on the web.
 * @param summary - text summary (50 words)
 * @param ada_v2: embedding value array. Note this is copied by value to avoid duplicating large arrays.
 * @param timeStamp - when the item is dated from - can be undefined if not known
 * @param relevance - cosine relevance score to a query - can be undefined if the source reference has not been compared yet
 */
export class KnowledgeSource extends MStreamable {
   private _url: string;
   private _summary: string;
   private _ada_v2: Array<number>;
   private _timeStamp: Date | undefined;   
   private _relevance: number | undefined;

   /**
    * Create an empty KnowledgeSource object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a KnowledgeSource object
    * @param url_ - link to source on the web.
    * @param summary_ - text summary (50 words)
    * @param ada_v2_: embedding value array. Note this is copied by value to avoid duplicating large arrays.
    * @param timeStamp_ - when the item is dated from - can be undefined if not known
    * @param relevance_ - cosine relevance score to a query - can be undefined if the source reference has not been compared yet
    */
   public constructor(url_: string, summary_: string, ada_v2_: Array<number>, 
                      timeStamp_: Date | undefined, relevance_: number | undefined);

   /**
    * Create a KnowledgeSource object
    * @param source - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(source: KnowledgeSource);

   public constructor(...arr: any[])
   {

      super();

      if (arr.length === 0) {
         this._url = ""; 
         this._summary = "";     
         this._ada_v2 = new Array<number> ();                  
         this._timeStamp = undefined;
         this._relevance = undefined;         
         return;
      }

      var localUrl: string;
      var localSummary: string;
      var localAda: Array<number>;
      var localTimeStamp: Date | undefined;      
      var localRelevance: number | undefined;

      if (arr.length === 1) {
         localUrl = arr[0]._url
         localSummary = arr[0]._summary;
         localAda = arr[0]._ada_v2;
         localTimeStamp = copyTimeStamp (arr[0]._timeStamp);
         localRelevance = copyRelevance (arr[0]._relevance);         
      }
      else { 
         localUrl = arr[0];
         localSummary = arr[1]; 
         localAda = arr[2];              
         localTimeStamp = copyTimeStamp (arr[3]);
         localRelevance = copyRelevance (arr[4]);           
      }

      this._url = localUrl;
      this._summary = localSummary;
      this._ada_v2 = localAda;
      this._timeStamp = localTimeStamp;      
      this._relevance = localRelevance;
   }

   streamOut(): string {

      return JSON.stringify({ url: this._url, summary: this._summary, ada_v2: this._ada_v2, timeStamp: this._timeStamp, relevance: this._relevance});
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      this.assign(new KnowledgeSource (obj.url, obj.summary, obj.ada_v2, obj.timeStamp, obj.relevance));   
   }

   /**
   * set of 'getters' for private variables
   */
   get url(): string {
      return this._url;
   }
   get summary(): string {
      return this._summary;
   }
   get ada_v2(): Array<number> {
      return this._ada_v2;
   }   
   get timeStamp(): Date | undefined {
      return this._timeStamp;
   }
   get relevance(): number | undefined {
      return this._relevance;
   }

   /**
   * set of 'setters' for private variables
   */
   set url(url_: string) {

      this._url = url_;
   }

   set summary(summary_: string) {

      this._summary = summary_;
   }

   set ada_v2(ada_v2_: Array<number>) {

      this._ada_v2 = ada_v2_;
   }   

   set timeStamp(timeStamp_: Date) {

      this._timeStamp = timeStamp_;
   }

   set relevance (relevance_: number) {

      this._relevance = relevance_;
   }

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: KnowledgeSource): boolean {

      return ((this._url === rhs._url) &&
         (this._summary === rhs._summary) &&
         (areSameShallowArray (this._ada_v2, rhs._ada_v2)) &&         
         (areSameDate (this._timeStamp, rhs._timeStamp)) &&         
         ((this._relevance === undefined && rhs._relevance === undefined) || (this._relevance === rhs._relevance)));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: KnowledgeSource): KnowledgeSource {

      this._url = rhs._url;
      this._summary = rhs._summary;
      this._ada_v2 = rhs._ada_v2;
      this._timeStamp = copyTimeStamp (rhs._timeStamp);      
      this._relevance = copyRelevance (rhs._relevance);

      return this;
   }
}

export const kDefaultKnowledgeSourceCount: number = 3;
export const kDefaultMinimumCosineSimilarity = 0.8;

/**
 * KnowledgeSources object
 * @param sources: Array of sources - can be zero length when created. 
 * Conceptually this class acts a 'bag' - keeps the top N sources in an unordererd array, only sorts them when requested at the end,
 * which avoids lots of re-sorting while searching for the top N. Should be OK performance wise as the loest value will climb up quite quickly. 
 */
export class KnowledgeSourceBuilder {

   private _sources: Array<KnowledgeSource>;
   private _similarityThresholdLo: number;
   private _howMany : number;

   /**
    * Create a KnowledgeSourceBuilder object
    * @param similarityThresholdLo_ - lowest bar for similarity
    * @param howMany_ - how many items to retrieve 
    */
   public constructor(similarityThresholdLo_: number, howMany_: number) {

      if (similarityThresholdLo_ < -1 || similarityThresholdLo_ > 1)
         throw new InvalidParameterError ("Cosine similarity must be between -1 and 1.");

      this._sources = new Array<KnowledgeSource> ();  
      this._similarityThresholdLo = similarityThresholdLo_;
      this._howMany = howMany_;            
   }

   /**
   * set of 'getters' for private variables
   */
   get similarityThreshold (): number {
      return this._similarityThresholdLo;
   }   
   get howMany (): number {
      return this._howMany;
   }        
   get sources (): Array<KnowledgeSource> {
      return this._sources;
   }   

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: KnowledgeSourceBuilder): boolean {

      return (this._howMany == rhs._howMany 
         && this._similarityThresholdLo == rhs._similarityThresholdLo 
         && areSameDeepArray (this._sources, rhs._sources));
   }

   /**
    * searches current most relevant results to see if the new one should be included.  
    * @param rhs - the object to assign this one from.  
    */
   private lowestOfCurrent (): number {

      if (this._sources.length === 0)
         return -1;

      let lowestRelevance = this._sources[0].relevance;
      let lowestIndex = 0;

      for (let i = 1; i < this._sources.length; i++) {

         let comp = this._sources[i].relevance;

         if (typeof comp !== 'undefined' && typeof lowestRelevance !== 'undefined') {
          
            if (comp < lowestRelevance) {
               lowestRelevance = comp;
               lowestIndex = i;
            }
         }
      }

      return lowestIndex;
   }   

   /**
    * searches current most relevant results to see if the new one should be included.  
    * @param candidate - the object to test  
    */
   replaceIfBeatsCurrent (candidate: KnowledgeSource): boolean {

      // If the array can grow we just add the new candidate
      if (this._sources.length < this._howMany) {
         if (typeof candidate.relevance !== 'undefined' && candidate.relevance >= this._similarityThresholdLo) {
            this._sources.push (candidate);
         }
         return true;
      }

      // Else we do a search an insert new if it is below current
      let lowestIndex = this.lowestOfCurrent();
      let currentLowest = this._sources[lowestIndex];

      if (typeof currentLowest.relevance !== 'undefined' 
      && typeof candidate.relevance !== 'undefined') {
         if (currentLowest.relevance < candidate.relevance && candidate.relevance >= this._similarityThresholdLo) {
            this._sources[lowestIndex] = candidate;
            return true;
         }
      }

      return false;
   }    
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param vector1 The first vector.
 * @param vector2 The second vector.
 * @returns The cosine similarity score.
 */
export function cosineSimilarity(vector1: number[], vector2: number[]): number {
   if (vector1.length !== vector2.length) {
       throw new Error("Vector dimensions must match for cosine similarity calculation.");
   }

   const dotProduct = vector1.reduce((acc, val, index) => acc + val * vector2[index], 0);
   const magnitude1 = Math.sqrt(vector1.reduce((acc, val) => acc + val ** 2, 0));
   const magnitude2 = Math.sqrt(vector2.reduce((acc, val) => acc + val ** 2, 0));

   if (magnitude1 === 0 || magnitude2 === 0) {
       throw new Error("Magnitude of a vector must be non-zero for cosine similarity calculation.");
   }

   return dotProduct / (magnitude1 * magnitude2);
}

export class KnowledgeRepository  {
   static lookUpMostSimilar (embedding: Array<number>, similarityThresholdLo: number, howMany: number) : KnowledgeSourceBuilder {

      let bestSources = new KnowledgeSourceBuilder(similarityThresholdLo, howMany);

      YouTubeRespository.lookUpMostSimilar (embedding, bestSources);
      MarkdownRespository.lookUpMostSimilar (embedding, bestSources);  

      return bestSources;
   }   
}

/**
 * YouTubeRespository 
 * Facade over imported JSON - at some point move to vector DB blah blah
 */
class YouTubeRespository  {
   
   static lookUpMostSimilar (embedding: Array<number>, builder: KnowledgeSourceBuilder): void {

      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      for (let i = 0; i < embeddings.length; i++) {

         let url = makeYouTubeUrl (embeddings[i].sourceId, embeddings[i].start, embeddings[i].seconds);
         let relevance = Number (cosineSimilarity (embedding, embeddings[i].ada_v2).toPrecision(2));

         let candidate = new KnowledgeSource (url, embeddings[i].summary, embeddings[i].ada_v2, undefined, relevance);
         let changed = builder.replaceIfBeatsCurrent (candidate);
      }      
   }
   
}

/**
 * MarkdownRespository 
 * Facade over imported JSON - at some point move to vector DB blah blah
 */
class MarkdownRespository  {
   
   static lookUpMostSimilar (embedding: Array<number>, builder: KnowledgeSourceBuilder): void {

      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteMarkdownEmbeddings as Array<LiteEmbedding>;

      for (let i = 0; i < embeddings.length; i++) {

         let url = makeGithubUrl (embeddings[i].sourceId);
         let relevance = Number (cosineSimilarity (embedding, embeddings[i].ada_v2).toPrecision(2));

         let candidate = new KnowledgeSource (url, embeddings[i].summary, embeddings[i].ada_v2, undefined, relevance);
         let changed = builder.replaceIfBeatsCurrent (candidate);
      }      
   }
   
}

export class KnowledgeEnrichedMessage extends MStreamable {

   private _message: string;
   private _sources: Array<KnowledgeSource>;

   /**
    * Create an empty KnowledgeEnrichedMessage object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a KnowledgeEnrichedMessage object
    * @param message_: the message back from the AI 
    * @param sources_: array of the best source objects
    */
   public constructor(message_: string, sources_: Array<KnowledgeSource>);

   /**
    * Create a KnowledgeEnrichedMessage object
    * @param source - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(source: KnowledgeEnrichedMessage);

   public constructor(...arr: any[])
   {

      super();

      if (arr.length === 0) {   

         this._message = "";         
         this._sources = new Array<KnowledgeSource> ();                          
         return;
      }

      if (arr.length === 1) {
         this._message = arr[0]._message;
         this._sources = arr[0]._sources; 
      }
      else {
         this._message = arr[0];
         this._sources = arr[1];      
      }
   }

   streamOut(): string {

      return JSON.stringify({ message: this._message, sources: this._sources});
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      this._message = obj.message;

      this._sources = new Array<KnowledgeSource> (); 

      for (let i = 0; i < obj.sources.length; i++) {
         let newSource = new KnowledgeSource (obj.sources[i]);
         this._sources.push (newSource);
      }
   }

   /**
   * set of 'getters' for private variables
   */
   get message (): string {
      return this._message;
   }     
   get sources (): Array<KnowledgeSource> {
      return this._sources;
   }   

   /**
   * set of 'setters' for private variables
   */
   set message(message_: string) {

      this._message = message_;
   }   
   set sources(sources_: Array<KnowledgeSource>) {

      this._sources = sources_;
   }   

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: KnowledgeEnrichedMessage): boolean {

      return (this._message === rhs._message && areSameDeepArray (this._sources, rhs._sources));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: KnowledgeEnrichedMessage): KnowledgeEnrichedMessage {

      this._message = rhs._message;
      this._sources = rhs._sources;

      return this;
   }
}