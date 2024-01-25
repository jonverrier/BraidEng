// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

import { IKeyGenerator } from './KeyGenerator';
import { UuidKeyGenerator } from './UuidKeyGenerator';
import { ConnectionError } from "./Errors";


export class JoinPageValidator {

   private activeCallCount: number;

   /**
    * Create an empty JoinPageValidator object 
    */
   constructor() {
      this.activeCallCount = 0;
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

   // makes Axios call to request the ID of a Fluid Container to use for the conversation
   async requestConversationKey  (apiUrl_: string, key_: string) : Promise<string> {
     
      this.activeCallCount++;

      const response = await axios.get(apiUrl_, {
         params: {
            JoinKey: key_
         },
         withCredentials: false
      });

      this.activeCallCount--;

      if (!response.data)
         throw new ConnectionError("Error connecting to remote data services for conversation key: " + key_ + ".");

      return response.data as string;
   }    

   isBusy () {
      return this.activeCallCount !== 0;
   }
}