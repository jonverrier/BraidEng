// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

import { IKeyGenerator } from './KeyGenerator';
import { UuidKeyGenerator } from './UuidKeyGenerator';
import { JoinKey } from "./JoinKey";

export class JoinPageValidator {

   /**
    * Create an empty JoinPageValidator object 
    */
   constructor() {
   }   

   // Looks at the name and key provided, and returns true if the data looks ready to join a conversation, else false.
   isJoinAttemptReady  (name_: string, key_: JoinKey) : boolean {

      if (name_.length < 1)
         return false;

      if (!key_.isValid)
         return false;

      return true;
   }
}