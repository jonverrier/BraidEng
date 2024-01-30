// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

import { IKeyGenerator } from './KeyGenerator';
import { UuidKeyGenerator } from './UuidKeyGenerator';

export class JoinKey {

   private _isValid: boolean;
   private _isSinglePart: boolean;
   private _isTwoPart: boolean;
   private _firstPart: string;
   private _secondPart: string;

   /**
    * Create a JoinKey object. A join key is in the format 'UUID/Optional Container GUID'. 
    * It can be valid with just the first part, which is then a join key and the container must be created new, or if there is a second part, it must be in a valid format. 
    */
   constructor(trialInput_: string) {

      this._isValid = false;        
      this._isSinglePart = false;   
      this._isTwoPart = false;
      this._firstPart = "";
      this._secondPart = "";

      let split = trialInput_.split('/');

      if (split.length === 1) {
         if (this.isValidPart1 (split[0])) {
            this._isValid = true;
            this._isSinglePart = true;
            this._firstPart = split[0];
         }
      }
      else
      if (split.length === 2) {
         if (this.isValidPart1 (split[0]) && this.isValidPart2 (split[1])) {
            this._isValid = true;
            this._isTwoPart = true;
            this._firstPart = split[0];
            this._secondPart = split[1];
         }
      }      
   }   
   
   /**
   * set of 'getters' for private variables
   */
   get isValid(): boolean {
      return this._isValid;
   }
   get isSinglePart(): boolean {
      return this._isSinglePart;
   }
   get isTwoPart(): boolean {
      return this._isTwoPart;
   }   
   get firstPart(): string  {
      return this._firstPart;
   }
   get secondPart(): string  {
      return this._secondPart;
   }
   get asString(): string  {
      return this._firstPart + '/' + this._secondPart;
   }

   static makeFromTwoParts (part1_: string, part2_: string) {

      return new JoinKey (part1_ + '/' + part2_);
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