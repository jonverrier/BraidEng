// Copyright (c) 2024 Braid Technologies Ltd
import { IKeyGenerator } from './KeyGenerator';
import { UuidKeyGenerator } from './UuidKeyGenerator';

export class JoinPath {

   private _isValid: boolean;
   private _hasSessionOnly: boolean;
   private _hasSessionAndConversation: boolean;
   private _sessionId: string;
   private _conversationId: string;

   /**
    * Create a JoinKey object. A join key is in the format 'UUID/Optional Container GUID'. 
    * It can be valid with just the first part, which is then a join key and the container must be created new, or if there is a second part, it must be in a valid format. 
    */
   constructor(trialInput_: string) {

      this._isValid = false;        
      this._hasSessionOnly = false;   
      this._hasSessionAndConversation = false;
      this._sessionId = "";
      this._conversationId = "";

      let split = trialInput_.split('/');

      if (split.length === 1 || (split.length === 2 && split[1] === '')) {
         if (this.isValidPart1 (split[0])) {
            this._isValid = true;
            this._hasSessionOnly = true;
            this._sessionId = split[0];
         }
      }
      else
      if (split.length === 2) {
         if (this.isValidPart1 (split[0]) && this.isValidPart2 (split[1])) {
            this._isValid = true;
            this._hasSessionAndConversation = true;
            this._sessionId = split[0];
            this._conversationId = split[1];
         }
      }      
   }   
   
   /**
   * set of 'getters' for private variables
   */
   get isValid(): boolean {
      return this._isValid;
   }
   get hasSessionOnly(): boolean {
      return this._hasSessionOnly;
   }
   get hasSessionAndConversation(): boolean {
      return this._hasSessionAndConversation;
   }   
   get sessionId(): string  {
      return this._sessionId;
   }
   get conversationId(): string  {
      return this._conversationId;
   }
   get asString(): string  {
      return this._sessionId + '/' + this._conversationId;
   }

   static makeFromTwoParts (part1_: string, part2_: string) {

      return new JoinPath (part1_ + '/' + part2_);
   }

   // Looks at the key provided, and returns true if it looks like a GUID, else false.
   private isValidPart1  (trialInput_: string) : boolean {

      let keyGenerator : IKeyGenerator = new UuidKeyGenerator();

      if (!keyGenerator.couldBeAKey (trialInput_))
         return false;

      return true;
   }

   // Looks at the key provided, and returns true if it looks like a container ID, else false.
   private isValidPart2  (trialInput_: string) : boolean {

      if (trialInput_.length === 0)
         return false;

      return true;
   }   
}