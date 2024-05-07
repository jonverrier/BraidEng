// Copyright (c) 2024 Braid Technologies Ltd
 
import { MStreamable } from "./StreamingFramework";
import { areSameDate, areSameShallowArray, areSameDeepArray} from './Utilities';
import { LiteEmbedding, makeYouTubeUrl, makeGithubUrl, makeWebUrl } from "../core/EmbeddingFormats";
import liteYouTubeEmbeddings from '../core/youtube_embeddings_lite.json';
import liteMarkdownEmbeddings from '../core/markdown_embeddings_lite.json';
import liteHtmlEmbeddings from '../core/html_embeddings_lite.json';
import { InvalidParameterError } from "./Errors";
import { Message } from "./Message";
import { EUIStrings } from "../ui/UIStrings";
import { EConfigStrings } from "./ConfigStrings";

function copyTimeStamp (stamp: Date | undefined) : Date | undefined {
   return (typeof stamp === 'undefined') ? undefined : new Date(stamp);
}

function copyRelevance (relevance: number | undefined) : number | undefined {
   return (typeof relevance === 'undefined') ? undefined : relevance;
}

const youTubeHostname = "www.youtube.com";

export function isYouTube (url: string) : boolean {
   let youTubeHostname = "www.youtube.com";

   const URLIn = new URL (url);

   if (URLIn.hostname === (youTubeHostname)) {
      return true;
   }
   else {
      return false;
   }
}

export function lookLikeSameSource (url1: string, url2: string ) : boolean {

   // Youtube format URL
   // https://www.youtube.com/watch?v=l5mG4z343qg&t=00h00m00s

   const URLLeft = new URL (url1);
   const URLRight = new URL (url2);

   if (URLLeft.hostname === (youTubeHostname) && URLRight.hostname === (youTubeHostname)) {
      // To compare two YouTube URLs we look at the ?v= parameter for the video ID
      const videoLeft = URLLeft.searchParams.get('v');
      const videoRight = URLRight.searchParams.get('v');  
      
      if (videoLeft === videoRight)
         return true;
      else
         return false;

   }

   if ((URLLeft.hostname === URLRight.hostname) && (URLLeft.pathname === URLRight.pathname)) {
      return true;
   }

   return false;
}

/**
 * KnowledgeChunk object
 * @param url - link to source on the web.
 * @param summary - text summary (50 words)
 * @param ada_v2: embedding value array. Note this is copied by value to avoid duplicating large arrays.
 * @param timeStamp - when the item is dated from - can be undefined if not known
 * @param relevance - cosine relevance score to a query - can be undefined if the source reference has not been compared yet
 */
export class KnowledgeChunk extends MStreamable {
   private _url: string;
   private _summary: string;
   private _ada_v2: Array<number>;
   private _timeStamp: Date | undefined;   
   private _relevance: number | undefined;

   /**
    * Create an empty KnowledgeSegment object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a KnowledgeChunk object
    * @param url_ - link to source on the web.
    * @param summary_ - text summary (50 words)
    * @param ada_v2_: embedding value array. Note this is copied by value to avoid duplicating large arrays.
    * @param timeStamp_ - when the item is dated from - can be undefined if not known
    * @param relevance_ - cosine relevance score to a query - can be undefined if the source reference has not been compared yet
    */
   public constructor(url_: string, summary_: string, ada_v2_: Array<number>, 
                      timeStamp_: Date | undefined, relevance_: number | undefined);

   /**
    * Create a KnowledgeChunk object
    * @param source - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(source: KnowledgeChunk);

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

      this.assign(new KnowledgeChunk (obj.url, obj.summary, obj.ada_v2, obj.timeStamp, obj.relevance));   
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
   equals(rhs: KnowledgeChunk): boolean {

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
   assign(rhs: KnowledgeChunk): KnowledgeChunk {

      this._url = rhs._url;
      this._summary = rhs._summary;
      this._ada_v2 = rhs._ada_v2;
      this._timeStamp = copyTimeStamp (rhs._timeStamp);      
      this._relevance = copyRelevance (rhs._relevance);

      return this;
   }
}

export const kDefaultKnowledgeSegmentCount: number = 3;
export const kDefaultMinimumCosineSimilarity = 0.8;

/**
 * KnowledgeChunkFinder object
 * @param similarityThresholdLo_: Lowest cosine similarity to allow
 * @param howMany_: how many segments to collect
 * Conceptually this class acts a 'bag' - keeps the top N sources in an unordererd array, only sorts them when requested at the end,
 * which avoids lots of re-sorting while searching for the top N. Should be OK performance wise as the loest value will climb up quite quickly. 
 */
export class KnowledgeChunkFinder {

   private _chunks: Array<KnowledgeChunk>;
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

      this._chunks = new Array<KnowledgeChunk> ();  
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
   get chunks (): Array<KnowledgeChunk> {
      return this._chunks;
   }   

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: KnowledgeChunkFinder): boolean {

      return (this._howMany == rhs._howMany 
         && this._similarityThresholdLo == rhs._similarityThresholdLo 
         && areSameDeepArray (this._chunks, rhs._chunks));
   }

   /**
    * searches current most relevant results to see if the new one should be included.  
    * @param rhs - the object to assign this one from.  
    */
   private lowestOfCurrent (): number {

      if (this._chunks.length === 0)
         return -1;

      let lowestRelevance = this._chunks[0].relevance;
      let lowestIndex = 0;

      for (let i = 1; i < this._chunks.length; i++) {

         let comp = this._chunks[i].relevance;

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
   replaceIfBeatsCurrent (candidate: KnowledgeChunk): boolean {

      // First check if its just the same source e.g. different chunk of a Youtube video
      for (let i = 0; i < this._chunks.length; i++) {
         if (lookLikeSameSource (candidate.url, this._chunks[i].url))
            return false;
      }

      // If the array can grow we just add the new candidate
      if (this._chunks.length < this._howMany) {
         if (typeof candidate.relevance !== 'undefined' && candidate.relevance >= this._similarityThresholdLo) {
            this._chunks.push (candidate);
         }
         return true;
      }

      // Else we do a search an insert new if it is below current
      let lowestIndex = this.lowestOfCurrent();
      let currentLowest = this._chunks[lowestIndex];

      if (typeof currentLowest.relevance !== 'undefined' 
      && typeof candidate.relevance !== 'undefined') {
         if (currentLowest.relevance < candidate.relevance && candidate.relevance >= this._similarityThresholdLo) {
            this._chunks[lowestIndex] = candidate;
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

   static lookUpMostSimilar (embedding: Array<number>, similarityThresholdLo: number, howMany: number) : KnowledgeChunkFinder {

      let bestSources = new KnowledgeChunkFinder(similarityThresholdLo, howMany);

      YouTubeRespository.lookUpMostSimilar (embedding, bestSources);
      MarkdownRespository.lookUpMostSimilar (embedding, bestSources);  
      HtmlRespository.lookUpMostSimilar (embedding, bestSources); 

      return bestSources;
   }   

   /**
    * lookUpSimilarfromUrl 
    * look to see of we have similar content from other sources
    */   
   static lookUpSimilarfromUrl (url_: string, similarityThresholdLo: number, howMany: number) : KnowledgeChunkFinder {
      
      var chunkIn: KnowledgeChunk | undefined = undefined;

      if (isYouTube (url_))
         chunkIn = YouTubeRespository.lookUpUrl ("https://www.youtube.com/watch?v=l5mG4z343qg&t=00h00m00s");
      else
         chunkIn =  HtmlRespository.lookUpUrl ("https://huyenchip.com/2023/04/11/llm-engineering.html"); 

      if (chunkIn) {
         return KnowledgeRepository.lookUpMostSimilar (chunkIn.ada_v2, similarityThresholdLo, howMany);
      }

      return new KnowledgeChunkFinder(kDefaultMinimumCosineSimilarity, howMany);
   }

   static lookForSuggestedContent (url_: string | undefined) : Message | undefined {

      let candidateChunk : KnowledgeChunk | undefined = undefined;
      let haveUrl = true;

      // If we do not have a history, provide a helpful start point 
      if (!url_) {
         haveUrl = false;
         url_ = "https://github.com/microsoft/generative-ai-for-beginners/blob/main/01-introduction-to-genai/README.md";         
         candidateChunk = MarkdownRespository.lookUpUrl (url_);
      }
      else {
         let finder = KnowledgeRepository.lookUpSimilarfromUrl (url_, kDefaultMinimumCosineSimilarity, kDefaultKnowledgeSegmentCount);         
         if (finder.chunks.length > 0)
            candidateChunk = finder.chunks[0];
      }

      if (candidateChunk) {

         let suggested = new Message();
         suggested.authorId = EConfigStrings.kLLMGuid;
         suggested.text = haveUrl ? EUIStrings.kNeedInspirationHereIsAnother : EUIStrings.kNewUserNeedInspiration;
         suggested.sentAt = new Date();

         let chunks = new Array<KnowledgeChunk> ();         
         chunks.push (candidateChunk);

         suggested.chunks = chunks;

         return suggested;
      }
      
      return undefined;   
   }
}

/**
 * YouTubeRespository 
 * Facade over imported JSON - at some point move to vector DB blah blah
 */
class YouTubeRespository  {
   
   static lookUpMostSimilar (embedding: Array<number>, builder: KnowledgeChunkFinder): void {

      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      for (let i = 0; i < embeddings.length; i++) {

         let url = makeYouTubeUrl (embeddings[i].sourceId, embeddings[i].start, embeddings[i].seconds);
         let relevance = Number (cosineSimilarity (embedding, embeddings[i].ada_v2).toPrecision(2));

         let candidate = new KnowledgeChunk (url, embeddings[i].summary, embeddings[i].ada_v2, undefined, relevance);
         let changed = builder.replaceIfBeatsCurrent (candidate);
      }      
   }

   static lookUpUrl (url_: string) : KnowledgeChunk | undefined {

      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      for (let i = 0; i < embeddings.length; i++) {

         let url = makeYouTubeUrl (embeddings[i].sourceId, embeddings[i].start, embeddings[i].seconds);
         if (url === url_) {
            let candidate = new KnowledgeChunk (url, embeddings[i].summary, embeddings[i].ada_v2, undefined, undefined);
            return candidate;
         }
      }  

      return undefined;
   }
   
}

/**
 * MarkdownRespository 
 * Facade over imported JSON - at some point move to vector DB blah blah
 */
class MarkdownRespository  {
   
   static lookUpMostSimilar (embedding: Array<number>, builder: KnowledgeChunkFinder): void {

      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteMarkdownEmbeddings as Array<LiteEmbedding>;

      for (let i = 0; i < embeddings.length; i++) {

         let url = makeGithubUrl (embeddings[i].sourceId);
         let relevance = Number (cosineSimilarity (embedding, embeddings[i].ada_v2).toPrecision(2));

         let candidate = new KnowledgeChunk (url, embeddings[i].summary, embeddings[i].ada_v2, undefined, relevance);
         let changed = builder.replaceIfBeatsCurrent (candidate);
      }      
   }
   static lookUpUrl (url_: string) : KnowledgeChunk | undefined {

      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteMarkdownEmbeddings as Array<LiteEmbedding>;

      for (let i = 0; i < embeddings.length; i++) {

         let url = makeGithubUrl (embeddings[i].sourceId);
         if (url === url_) {
            let candidate = new KnowledgeChunk (url, embeddings[i].summary, embeddings[i].ada_v2, undefined, undefined);
            return candidate;
         }
      }  

      return undefined;
   }   
   
}

class HtmlRespository  {
   
   static lookUpMostSimilar (embedding: Array<number>, builder: KnowledgeChunkFinder): void {

      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteHtmlEmbeddings as Array<LiteEmbedding>;

      for (let i = 0; i < embeddings.length; i++) {

         let url = makeWebUrl (embeddings[i].sourceId);
         let relevance = Number (cosineSimilarity (embedding, embeddings[i].ada_v2).toPrecision(2));

         let candidate = new KnowledgeChunk (url, embeddings[i].summary, embeddings[i].ada_v2, undefined, relevance);
         let changed = builder.replaceIfBeatsCurrent (candidate);
      }      
   }

   static lookUpUrl (url_: string) : KnowledgeChunk | undefined {

      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteHtmlEmbeddings as Array<LiteEmbedding>;

      for (let i = 0; i < embeddings.length; i++) {

         let url = makeWebUrl (embeddings[i].sourceId);
         if (url === url_) {
            let candidate = new KnowledgeChunk (url, embeddings[i].summary, embeddings[i].ada_v2, undefined, undefined);
            return candidate;
         }
      }  

      return undefined;
   }   
   
}

export class KnowledgeEnrichedMessage extends MStreamable {

   private _message: string;
   private _segments: Array<KnowledgeChunk>;

   /**
    * Create an empty KnowledgeEnrichedMessage object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a KnowledgeEnrichedMessage object
    * @param message_: the message back from the AI 
    * @param segments_: array of the best source objects
    */
   public constructor(message_: string, segments_: Array<KnowledgeChunk>);

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
         this._segments = new Array<KnowledgeChunk> ();                          
         return;
      }

      if (arr.length === 1) {
         this._message = arr[0]._message;
         this._segments = arr[0]._segments; 
      }
      else {
         this._message = arr[0];
         this._segments = arr[1];      
      }
   }

   streamOut(): string {

      return JSON.stringify({ message: this._message, segments: this._segments});
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      this._message = obj.message;

      this._segments = new Array<KnowledgeChunk> (); 

      for (let i = 0; i < obj.segments.length; i++) {
         let newSource = new KnowledgeChunk (obj.segments[i]);
         this._segments.push (newSource);
      }
   }

   /**
   * set of 'getters' for private variables
   */
   get message (): string {
      return this._message;
   }     
   get segments (): Array<KnowledgeChunk> {
      return this._segments;
   }   

   /**
   * set of 'setters' for private variables
   */
   set message(message_: string) {

      this._message = message_;
   }   
   set segments(segments_: Array<KnowledgeChunk>) {

      this._segments = segments_;
   }   

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: KnowledgeEnrichedMessage): boolean {

      return (this._message === rhs._message && areSameDeepArray (this._segments, rhs._segments));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: KnowledgeEnrichedMessage): KnowledgeEnrichedMessage {

      this._message = rhs._message;
      this._segments = rhs._segments;

      return this;
   }
}