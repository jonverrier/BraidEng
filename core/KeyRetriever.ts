// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

import { ConnectionError } from "./Errors";
import { EEnvironment, Environment } from "./Environment";
import { throwIfUndefined } from "./Asserts";

export class KeyRetriever {

   private activeCallCount: number;

   /**
    * Create an empty JoinPageValidator object 
    */
   constructor() {
      this.activeCallCount = 0;
   }   

   // makes Axios call to request the ID of a Fluid Container to use for the conversation
   async requestKey  (apiUrl_: string, paramName_: string, key_: string) : Promise<string> {
     
      let environment = Environment.environment();

      if (environment === EEnvironment.kLocal) {
         let checked = process.env[paramName_];
         throwIfUndefined(checked);
         return checked;
      }
      
      this.activeCallCount++;

      var response;

      try {
         response = await axios.get(apiUrl_, {
         params: {
            [paramName_]: key_
         },
         withCredentials: false
      });
      } catch (e) {
         this.activeCallCount--;
      }

      if (!response || !response.data)
         throw new ConnectionError("Error connecting to remote data services for conversation key: " + key_ + ".");      
      
      return response.data as string;
   }    

   isBusy () {
      return this.activeCallCount !== 0;
   }
}