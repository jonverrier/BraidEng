// Copyright (c) 2024 Braid Technologies Ltd

// 3rd party imports
//import * as Realm from "realm-web";
//const {
//   BSON: { ObjectId },
// } = Realm;
import axios from "axios";


// Internal imports
import { Environment, EEnvironment } from "./Environment";
import { EConfigStrings } from "./ConfigStrings";
import { KeyRetriever } from "./KeyRetriever";
import { logDbError, logApiError } from "./Logging";
import { ActivityRecord } from './ActivityRecord';

export interface IActivityRepository {

   save (record : ActivityRecord) : Promise<boolean>;


}

export function getRecordRepository (joinKey: string) : IActivityRepository {
   return new ActivityRepository(joinKey);   
}

// ActivityRecord - email of a person and a datestamp. Will have many derived classes according to different activity types. 
export class ActivityRepository implements IActivityRepository {

   private _dbkey: string | undefined;
   private _joinKey: string;

   /**
    * Create an ActivityRepository object 
    * @param joinKey - joining key
    */
   public constructor(joinKey: string) {

      this._dbkey = undefined;
      this._joinKey = joinKey;
   }

   async connect (joinKey : string) : Promise<string | undefined> {
      let retriever = new KeyRetriever();
      var url: string;

      if (Environment.environment() === EEnvironment.kLocal)
         url = EConfigStrings.kRequestLocalDbKeyUrl;
      else
         url = EConfigStrings.kRequestDbKeyUrl;
      
      let self = this;

      let done = new Promise<string | undefined>(function(resolve, reject) {
         
         retriever.requestKey (url, 
            EConfigStrings.kRequestKeyParameterName, 
            joinKey)
         .then ((key) => {
            self._dbkey = key;
            resolve (key);
         })
         .catch ((error: any) => {
            logApiError ("Error getting database key:", error);   
            resolve(undefined);   
         });
      });

      return done;
   }

   async save (record : ActivityRecord) : Promise<boolean> {
      
      let self = this;

      if (!self._dbkey) {
         await self.connect(self._joinKey);
      }

      let done = new Promise<boolean>(function(resolve, reject) {

         let stream = record.streamOut ();
         let document = JSON.parse(stream);
         let key = self._dbkey;

         axios.post('https://eu-west-1.aws.data.mongodb-api.com/app/braidlmsclient-fsivu/endpoint/data/v1/action/insertOne', 
         {   
            "dataSource": "mongodb-atlas",
            "database": "BraidLms",
            "collection": "Activity",
            "document": document
          },
          {
             headers: {                  
               "apiKey": key,
               "Content-Type": "application/ejson",                  
               "Accept": "application/json",
            }              
         })
         .then((resp : any) => {

            resolve(true);
         })
         .catch((error: any) => {   

            logDbError ("Error calling database:", error);   
            resolve(false);     
         });  
      });
   
      return done;
   }

}
