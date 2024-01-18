// Copyright (c) 2024 Braid Technologies Ltd
import { IKeyGenerator } from './KeyGenerator';
import { UuidKeyGenerator } from './UuidKeyGenerator';

export class JoinPageValidator {

   /**
    * Create an empty JoinPageValidator object 
    */
   constructor() {
   }   

   // Looks at the name and key provided, and returns true if the data looks ready to join a conversation, else false.
   isJoinAttemptReady  (name_: string, key_: string) : boolean {

      if (name_.length < 1)
         return false;

      let keyGenerator : IKeyGenerator = new UuidKeyGenerator();

      if (!keyGenerator.couldBeAKey (key_))
         return false;

      return true;
   }
}