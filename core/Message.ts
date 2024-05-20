// Copyright (c) 2024 Braid Technologies Ltd

import GPT4Tokenizer from 'gpt4-tokenizer';

import { InvalidParameterError } from './Errors';
import { throwIfUndefined } from './Asserts'; 
import { IKeyGenerator } from './IKeyGenerator';
import { getDefaultKeyGenerator } from './IKeyGeneratorFactory';
import { MDynamicStreamable, DynamicStreamableFactory } from "./StreamingFramework";
import { areSameDate, areSameDeepArray } from './Utilities';
import { Embedding } from './Embedding';

var keyGenerator: IKeyGenerator = getDefaultKeyGenerator();

const className = "Message";

// Message - text, plus IDs for the message itself, if its a reply, the person who sent it, and a date-time stamp
export class Message extends MDynamicStreamable {
   private _id: string;
   private _authorId: string;
   private _responseToId: string | undefined;   
   private _text: string;
   private _sentAt: Date;
   private _chunks: Array<Embedding>;
   private _tokens: number;
   private _isDirty: boolean;

   /**
    * Create an empty Message object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a Message object
    * @param id_ - id to use to generate uniqueness 
    * @param authorId_ - Id of the person who sent it
    * @param responseToId_ - id of the message to which it is a response, can be undefined
    * @param text_ - the message body
    * @param sentAt - timestamp for last interaction seen by the framework
    */
   public constructor(id_: string | undefined, authorId_: string | undefined, responseToId_: string | undefined, text_: string, sentAt: Date);

   /**
    * Create a Message object
    * @param id_ - id to use to generate uniqueness 
    * @param authorId_ - Id of the person who sent it
    * @param responseToId_ - id of the message to which it is a response, can be undefined
    * @param text_ - the message body
    * @param sentAt - timestamp for last interaction seen by the framework
    * @param chunks_ - relevent knowledge sources that help understand / provide context for the message. 
    */
   public constructor(id_: string | undefined, authorId_: string | undefined, responseToId_: string | undefined, text_: string, sentAt: Date,
                      chunks_: Array<Embedding>);

   /**
    * Create a Message object
    * @param message - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(message: Message);

   public constructor(...arr: any[])
   {

      super();

      if (arr.length === 0) {
         this._id = keyGenerator.generateKey(); // An new Message has a key
         this._authorId = "";                       // But not an author
         this._responseToId = undefined;
         this._text = "";         
         this._sentAt = new Date();
         this._chunks = new Array<Embedding> ();
         this._tokens = 0;
         this._isDirty = true;
         return;
      }

      var localId: string;
      var localAuthorId: string;
      var localResponseToId: string;
      var localText: string;
      var localSentAt: Date;
      var localChunks: Array<Embedding>;

      if (arr.length === 1) {
         localId = arr[0]._id
         localAuthorId = arr[0]._authorId;
         localResponseToId = arr[0]._responseToId;
         localText = arr[0]._text;         
         localSentAt = new Date(arr[0]._sentAt);
         localChunks = arr[0]._chunks;
      }
      else if (arr.length === 5) {
         localId = arr[0];
         localAuthorId = arr[1];      
         localResponseToId = arr[2];
         localText = arr[3];           
         localSentAt = new Date (arr[4]); 
         localChunks = new Array<Embedding>();         
      }
      else { 
         localId = arr[0];
         localAuthorId = arr[1];      
         localResponseToId = arr[2];
         localText = arr[3];           
         localSentAt = new Date (arr[4]);         
         localChunks = arr[5];
      }

      if (!Message.isValidId(localId)) {
         throw new InvalidParameterError("Id:" + localId + '.');
      }

      this._id = localId;
      this._authorId = localAuthorId;
      this._responseToId = localResponseToId;      
      this._text = localText;
      this._sentAt = localSentAt;
      this._chunks = localChunks;
      this._tokens = 0;
      this._isDirty = true;      
   }

   /**
    * Dynamic creation for Streaming framework
    */
   className(): string {

      return className;
   }

   static createDynamicInstance(): MDynamicStreamable {
      return new Message();
   }

   static _dynamicStreamableFactory: DynamicStreamableFactory = new DynamicStreamableFactory(className, Message.createDynamicInstance);
   streamOut(): string {

      return JSON.stringify({ id: this._id, authorId: this._authorId, 
                            responseToId: this._responseToId, 
                            text: this._text, sentAt: this._sentAt,
                            chunks: this._chunks});
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      let chunks = new Array<Embedding> (); 
      let objChunks = obj.chunks;

      if (objChunks) {
         for (let i = 0; i < objChunks.length; i++) {
            let newSource = new Embedding (objChunks[i]);
            chunks.push (newSource);
         }      
      }
      this.assign(new Message (obj.id, obj.authorId, obj.responseToId, obj.text, new Date(obj.sentAt), chunks));
   }

   /**
   * set of 'getters' for private variables
   */
   get id(): string {
      return this._id;
   }
   get authorId(): string {
      return this._authorId;
   }
   get responseToId(): string | undefined {
      return this._responseToId;
   }
   get text(): string {
      return this._text;
   }
   get sentAt(): Date {
      return this._sentAt;
   }
   get chunks(): Array<Embedding> {
      return this._chunks;
   }
   get isDirty(): boolean {
      return this._isDirty;
   }   
   get tokens(): number {
      if (this._isDirty) {
         const tokenizer = new GPT4Tokenizer({ type: 'gpt3' }); 

         let estimatedTokens = tokenizer.estimateTokenCount(this._text);

         if (this._chunks) {
            for (let i = 0; i < this._chunks.length; i++) {
               estimatedTokens += tokenizer.estimateTokenCount(this._chunks[i].summary);
            }
         }
         this._tokens = estimatedTokens;
         this._isDirty = false;
      }
      return this._tokens;
   }    
   get checkedResponseToId(): string {
      throwIfUndefined (this._responseToId);        
      return this._responseToId;
   }

   /**
   * set of 'setters' for private variables
   */
   set id(id_: string) {
      if (!Message.isValidId(id_)) {
         throw new InvalidParameterError("Id:" + id_ + '.');
      }

      this._id = id_;
   }

   set authorId(authorId_: string) {

      this._authorId = authorId_;
   }

   set text (text_: string) {

      this._text = text_;
      this._isDirty = true;
   }

   set responseToId(responseToId_: string) {

      this._responseToId = responseToId_;
   }

   set sentAt (sentAt_: Date) {

      this._sentAt = new Date(sentAt_);
   }

   set chunks (chunks_: Array<Embedding>) {
      this._chunks = chunks_;
      this._isDirty = true;      
   }

   /**
    * is this message unprompted i.e. not a reply.  
    */ 
   isUnPrompted () : boolean {
      return (typeof (this._responseToId) === "undefined") ;
   }

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: Message): boolean {

      return ((this._id === rhs._id) &&
         (this._authorId === rhs._authorId) &&
         ((this._responseToId === undefined && rhs._responseToId === undefined) || (this._responseToId === rhs._responseToId)) &&         
         (this._text === rhs._text) &&         
         (areSameDate (this._sentAt, rhs._sentAt)) &&
         areSameDeepArray (this._chunks, rhs._chunks));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: Message): Message {
      this._id = rhs._id;
      this._authorId = rhs._authorId;
      this._responseToId = rhs._responseToId;      
      this._text = rhs._text;
      this._sentAt = new Date (rhs._sentAt);
      this._chunks = rhs._chunks;
      this._tokens = 0;
      this._isDirty = true;      

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
