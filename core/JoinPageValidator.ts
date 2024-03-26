// Copyright (c) 2024 Braid Technologies Ltd
import { JoinPath } from "./JoinPath";

export class JoinPageValidator {

   /**
    * Create an empty JoinPageValidator object 
    */
   constructor() {
   }   

   // Looks at the name and key provided, and returns true if the data looks ready to join a conversation, else false.
   isJoinAttemptReady  (name_: string, key_: JoinPath) : boolean {

      if (name_.length < 3)
         return false;

      if (!key_.isValid)
         return false;

      return true;
   }
}