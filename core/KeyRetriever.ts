// Copyright (c) 2024 Braid Technologies Ltd

import axios from "axios";

// Other 3rd party imports
import { log, LogLevel, tag } from 'missionlog';

// Local
import { EConfigStrings } from './ConfigStrings';
import { ConnectionError } from "./Errors";
import { EEnvironment, Environment } from "./Environment";
import { throwIfUndefined } from "./Asserts";
import { KStubEnvironmentVariables } from "./ConfigStrings";


// Logging handler
const logger = {
   [LogLevel.ERROR]: (tag, msg, params) => console.error(msg, ...params),
   [LogLevel.WARN]: (tag, msg, params) => console.warn(msg, ...params),
   [LogLevel.INFO]: (tag, msg, params) => console.log(msg, ...params),
   [LogLevel.TRACE]: (tag, msg, params) => console.log(msg, ...params),
   [LogLevel.DEBUG]: (tag, msg, params) => console.log(msg, ...params),
} as Record<LogLevel, (tag: string, msg: unknown, params: unknown[]) => void>;

export class KeyRetriever {

   private activeCallCount: number;

   /**
    * Create an empty KeyRetriever object 
    */
   constructor() {
      this.activeCallCount = 0;
   }   

   // Makes an Axios call to request the key
   // If running locally, looks for an environment variable
   async requestKey  (apiUrl_: string, paramName_: string, key_: string) : Promise<string> {
     
      let environment = Environment.environment();

      /*  Now we use a localhost server bcs it can access environment variables
      // If we are running locally, use the stub values - no Production secrets are really stored locally 
      if (environment === EEnvironment.kLocal) {
         type KStubEnvironmentVariableKey = keyof typeof KStubEnvironmentVariables;
         let memberKeyAsStr: KStubEnvironmentVariableKey = paramName_ as any;
         let checked = KStubEnvironmentVariables[memberKeyAsStr];
         throwIfUndefined(checked);
         return checked;
      }
      */

      this.activeCallCount++;

      var response;

      try {
         response = await axios.get(apiUrl_, {
            params: {
               [paramName_]: key_
            },
            withCredentials: false
         });
         this.activeCallCount--; 

      } catch (e) {
         
         this.activeCallCount--;
   
         logger.ERROR (EConfigStrings.kApiLogCategory, EConfigStrings.kErrorConnectingToKeyAPI, [e]);           
      }

      if (!response || !response.data)
         throw new ConnectionError(EConfigStrings.kErrorConnectingToKeyAPI);      
      
      return response.data as string;
   }    

   isBusy () {
      return this.activeCallCount !== 0;
   }
}