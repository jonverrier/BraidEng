// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

import { ConnectionError } from "./Errors";
import { EEnvironment, Environment } from "./Environment";
import { throwIfUndefined } from "./Asserts";
import { KStubEnvironmentVariables } from "./ConfigStrings";

export class KeyRetriever {

   private activeCallCount: number;

   /**
    * Create an empty JoinPageValidator object 
    */
   constructor() {
      this.activeCallCount = 0;
   }   

   // Makes an Axios call to request the key
   // If running locally, looks for an environment variable
   async requestKey  (apiUrl_: string, paramName_: string, key_: string) : Promise<string> {
     
      let environment = Environment.environment();

      // If we are running locally, use the stub values - no Production secrets are really stored locally 
      if (environment === EEnvironment.kLocal) {
         type KStubEnvironmentVariableKey = keyof typeof KStubEnvironmentVariables;
         let memberKeyAsStr: KStubEnvironmentVariableKey = paramName_ as any;
         let checked = KStubEnvironmentVariables[memberKeyAsStr];
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
         throw new ConnectionError("Error connecting to remote data services for url, remote, key: " + apiUrl_ + "," + paramName_ + "," + key_ + ".");      
      
      return response.data as string;
   }    

   isBusy () {
      return this.activeCallCount !== 0;
   }
}