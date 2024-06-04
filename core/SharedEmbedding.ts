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
   private _likedBy: Array<string>;

   /**
    * Create an empty Message object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a Message object
    * @param id_ - id to use to generate uniqueness 
    * @param url_ - URL
    * @param conversationId_ - in which conversation id the 'like' happen
    * @param likedBy_ - array of names of people that have liked it. 
    */
   public constructor(id_: string | undefined, url_: string | undefined, conversationId_: string | undefined,  
                      likedBy_: Array<string> | undefined);

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
      var localLikes: Array<string> = new Array<string> ();        

      if (arr.length === 0) {

         localId = keyGenerator.generateKey(); // A new SharedEmbedding has a key                                     
      }
      else 
      if (arr.length === 1) {

         localId = arr[0]._id
         localUrl = arr[0]._url;
         localConversationId = arr[0]._conversationId;         
         localLikes = arr[0]._likedBy.slice(0);         
      }
      else if (arr.length === 4) {
         localId = arr[0];
         localUrl = arr[1]; 
         localConversationId = arr[2];     
         if (arr[3])      
            localLikes = arr[3].slice(0);     
      }

      if (!SharedEmbedding.isValidId(localId)) {
         throw new InvalidParameterError("Id:" + localId + '.');
      }

      this._id = localId;    
      this._url = localUrl;
      this._conversationId = localConversationId;
      this._likedBy = localLikes;           
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
                            likedBy: this._likedBy});
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      let likedBy = new Array<string> (); 

      let objLikes = obj.likedBy;

      if (objLikes) {
         for (let i = 0; i < objLikes.length; i++) {
            likedBy.push (objLikes[i]);
         }      
      }     


      this.assign(new SharedEmbedding (obj.id, obj.url, obj.conversationId, likedBy));
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
      return this._likedBy.length;
   }
   get likedBy(): Array<string> {
      return this._likedBy;
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

   set likedBy (likedBy_: Array<string>) {
      this._likedBy = likedBy_.slice(0);     
   }


   /**
    * add a like 
    * @param name - the name of the person who has liked it.  
    */
   like(name: string): void {

      throwIfUndefined (this._url);

      let foundLike = false;
      let likeIndex = -1;

      for (let i = 0; i < this._likedBy.length && !foundLike; i++) {

         if (this._likedBy[i] === name) {
            foundLike = true;
            likeIndex = i;
         }
      }   

      if (foundLike)
         return;
      
      this._likedBy.push (name);  
   }

   /**
    * remove a like 
    * @param name - the name of the person who has a like.  
    */
   unlike(name: string): void {

      throwIfUndefined (this._url);

      let foundLike = false;
      let likeIndex = -1;

      for (let i = 0; i < this._likedBy.length && !foundLike; i++) {

         if (this._likedBy[i] === name) {
            foundLike = true;
            likeIndex = i;
         }
      }
      
      if (foundLike)
         this._likedBy.splice(likeIndex, 1);      
   }   

   /*
    * test for a like 
    * @param name - the name of the person who has liked it.  
    */
   isLikedBy (name: string): boolean {

      throwIfUndefined (this._url);

      let foundLike = false;

      for (let i = 0; i < this._likedBy.length && !foundLike; i++) {

         if (this._likedBy[i] === name) {
            foundLike = true;
         }
      }   

      return foundLike;
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
         areSameShallowArray (this._likedBy, rhs._likedBy));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: SharedEmbedding): SharedEmbedding {

      this._id = rhs._id;   
      this._url = rhs._url;
      this._conversationId = rhs._conversationId;
      this._likedBy = rhs._likedBy.slice(0);      

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

export function findInMap (url: string, map: Map<string, SharedEmbedding>) : SharedEmbedding | undefined {

   for (const [key, value] of map) {
      if (value.url === url)
         return value;
   }
   return undefined;
}
