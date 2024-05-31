// Copyright (c) 2024 Braid Technologies Ltd

import { InvalidParameterError } from './Errors';
import { throwIfUndefined } from './Asserts'; 
import { IKeyGenerator } from './IKeyGenerator';
import { getDefaultKeyGenerator } from './IKeyGeneratorFactory';
import { MDynamicStreamable, DynamicStreamableFactory } from "./StreamingFramework";
import { areSameShallowArray } from './Utilities';

var keyGenerator: IKeyGenerator = getDefaultKeyGenerator();

const className = "SharedEmbedding";

// SharedEmbedding - URL, conversation, net like count, emails of who has liked it, emails of who has disliked it. 
export class SharedEmbedding extends MDynamicStreamable {
   private _id: string; 
   private _url: string | undefined;
   private _conversationId: string | undefined;
   private _netLikeCount: number;
   private _likedBy: Array<string>;
   private _dislikedBy: Array<string>;

   /**
    * Create an empty Message object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a Message object
    * @param id_ - id to use to generate uniqueness 
    * @param url_ - URL
    * @param conversationId_ - in which conversation id the 'like' happen
    * @param netLikeCount - net of likes / dislikes, likes are +ve
    * @param likedBy_ - array of email addresses of people that have liked it. 
    * @param dislikedBy_ - array of email addresses of people that have disliked it.
    */
   public constructor(id_: string | undefined, url_: string | undefined, conversationId_: string | undefined, netLikeCount: number | undefined, 
                      likedBy_: Array<string> | undefined, dislikedBy_: Array<string> | undefined);

   /**
    * Create a SharedEmbedding object
    * @param sharedEmbedding_ - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(sharedEmbedding_: SharedEmbedding);

   public constructor(...arr: any[])
   {
      super();

      var localId: string = "";
      var localUrl: string | undefined = undefined;
      var localConversationId : string | undefined = undefined;
      var localNetLikeCount: number = 0;
      var localLikes: Array<string> = new Array<string> ();
      var localDislikes: Array<string> = new Array<string> ();         

      if (arr.length === 0) {

         localId = keyGenerator.generateKey(); // A new SharedEmbedding has a key                                     
      }
      else 
      if (arr.length === 1) {

         localId = arr[0]._id
         localUrl = arr[0]._url;
         localConversationId = arr[0]._conversationId;
         localNetLikeCount = arr[0]._netLikeCount;         
         localLikes = arr[0]._likedBy.slice(0);
         localDislikes = arr[0]._dislikedBy.slice(0);         
      }
      else if (arr.length === 6) {
         localId = arr[0];
         localUrl = arr[1]; 
         localConversationId = arr[2];     
         localNetLikeCount = arr[3];   
         if (arr[4])      
            localLikes = arr[4].slice(0); 
         if (arr[5])
            localDislikes = arr[5].slice(0);         
      }

      if (!SharedEmbedding.isValidId(localId)) {
         throw new InvalidParameterError("Id:" + localId + '.');
      }

      this._id = localId;    
      this._url = localUrl;
      this._conversationId = localConversationId;
      this._netLikeCount = localNetLikeCount;
      this._likedBy = localLikes;   
      this._dislikedBy = localDislikes;         
   }

   /**
    * Dynamic creation for Streaming framework
    */
   className(): string {

      return className;
   }

   static createDynamicInstance(): MDynamicStreamable {
      return new SharedEmbedding();
   }

   static _dynamicStreamableFactory: DynamicStreamableFactory = new DynamicStreamableFactory(className, SharedEmbedding.createDynamicInstance);

   streamOut(): string {

      return JSON.stringify({ id: this._id, url: this._url, conversationId: this._conversationId,
                            netLikeCount: this._netLikeCount, 
                            likedBy: this._likedBy, dislikedBy: this._dislikedBy});
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      let likedBy = new Array<string> (); 
      let dislikedBy = new Array<string> ();

      let objLikes = obj.likedBy;

      if (objLikes) {
         for (let i = 0; i < objLikes.length; i++) {
            likedBy.push (objLikes[i]);
         }      
      }

      let objDislikes = obj.dislikedBy;

      if (objDislikes) {
         for (let i = 0; i < objDislikes.length; i++) {
            dislikedBy.push (objDislikes[i]);
         }      
      }      


      this.assign(new SharedEmbedding (obj.id, obj.url, obj.conversationId, obj.netLikeCount, likedBy, dislikedBy));
   }

   /**
   * set of 'getters' for private variables
   */
   get id(): string {
      return this._id;
   }
   get url(): string | undefined {
      return this._url;
   }
   get conversationId(): string | undefined {
      return this._conversationId;
   }   
   get netLikeCount(): number {
      return this._netLikeCount;
   }
   get likedBy(): Array<string> {
      return this._likedBy;
   }
   get dislikedBy(): Array<string> {
      return this._dislikedBy;
   }       

   /**
   * set of 'setters' for private variables
   */
   set id(id_: string) {
      if (!SharedEmbedding.isValidId(id_)) {
         throw new InvalidParameterError("Id:" + id_ + '.');
      }

      this._id = id_;
   }

   set url(url_: string | undefined) {

      this._url = url_;
   }

   set conversationId(conversationId_: string | undefined) {

      this._conversationId = conversationId_;
   }   

   set netLikeCount (netLikeCount_: number) {

      this._netLikeCount = netLikeCount_;
   }

   set likedBy (likedBy_: Array<string>) {
      this._likedBy = likedBy_;     
   }

   set dislikedBy (dislikedBy_: Array<string>) {
      this._dislikedBy = dislikedBy_;     
   }   

   /**
    * add a like 
    * @param email - the email of the person who has liked it.  
    */
   like(email: string): void {

      throwIfUndefined (this._url);

      let foundLike = false;
      let foundDislike = false;
      let likeIndex = -1;
      let dislikeIndex = -1;

      for (let i = 0; i < this._likedBy.length && !foundLike; i++) {

         if (this._likedBy[i] === email) {
            foundLike = true;
            likeIndex = i;
         }
      }

      for (let i = 0; i < this._dislikedBy.length; i++) {
         if (this._dislikedBy[i] === email) {
            foundDislike = true;         
            dislikeIndex = i;
         }
      }      

      if (foundLike)
         return;
      
      if (foundDislike)
         this._dislikedBy = this._dislikedBy.splice(dislikeIndex, 1);
      
      this._likedBy.push (email);
      this._netLikeCount++;
   }

   /**
    * add a like 
    * @param email - the email of the person who has liked it.  
    */
   dislike(email: string): void {

      throwIfUndefined (this._url);

      let foundLike = false;
      let foundDislike = false;
      let likeIndex = -1;
      let dislikeIndex = -1;

      for (let i = 0; i < this._likedBy.length && !foundLike; i++) {

         if (this._likedBy[i] === email) {
            foundLike = true;
            likeIndex = i;
         }
      }

      for (let i = 0; i < this._dislikedBy.length; i++) {
         if (this._dislikedBy[i] === email) {
            foundDislike = true;         
            dislikeIndex = i;
         }
      }      

      if (foundDislike)
         return;
      
      if (foundLike)
         this._likedBy = this._likedBy.splice(likeIndex, 1);
      
      this._dislikedBy.push (email);      
      this._netLikeCount--;
   }   

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: SharedEmbedding): boolean {

      return ((this._id === rhs._id) &&
         ((this._url === undefined && rhs._url === undefined) || (this._url === rhs._url)) &&    
         ((this._conversationId === undefined && rhs._conversationId === undefined) || (this._conversationId === rhs._conversationId)) &&                
         (this._netLikeCount === rhs._netLikeCount) &&         
         areSameShallowArray (this._likedBy, rhs._likedBy) &&
         areSameShallowArray (this._dislikedBy, rhs._dislikedBy));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: SharedEmbedding): SharedEmbedding {

      this._id = rhs._id;   
      this._url = rhs._url;
      this._conversationId = rhs._conversationId;
      this._netLikeCount = rhs._netLikeCount;
      this._likedBy = rhs._likedBy.slice(0);
      this._dislikedBy = rhs._dislikedBy.slice(0);       

      return this;
   }

   /**
    * test for valid id 
    * @param id - the string to test
    */
   static isValidId(id_: string): boolean {
      if (!id_) // undefined keys are allowed if user object has not been originated from or saved anywhere persistent
         return true;

      if (id_ && id_.length > 0) // if the id exists, must be > zero length
         return true;

      return (false);
   }
}
