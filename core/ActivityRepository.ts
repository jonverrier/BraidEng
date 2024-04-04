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
import { UrlActivityRecord } from "./UrlActivityRecord";

export interface IActivityRepository {

   save (record : ActivityRecord) : Promise<boolean>;
   loadRecent (count : number) : Promise<Array<ActivityRecord>>;
}

export function getRecordRepository (joinKey: string) : IActivityRepository {
   return new ActivityRepository(joinKey);   
}

// ActivityRecord - email of a person and a datestamp. Will have many derived classes according to different activity types. 
export class ActivityRepository implements IActivityRepository {

   private _dbkey: string | undefined;
   private _joinKey: string;
   private _timer: NodeJS.Timeout | undefined;

   /**
    * Create an ActivityRepository object 
    * @param joinKey - joining key
    */
   public constructor(joinKey: string) {

      this._dbkey = undefined;
      this._joinKey = joinKey;
      this._timer = undefined;
   }

   disConnect () : void {
      if (this._timer) {
         clearInterval(this._timer);
         this._timer = undefined;
      }
   }

   async connect (joinKey : string) : Promise<string | undefined> {
      let retriever = new KeyRetriever();
      var url: string;

      if (Environment.environment() === EEnvironment.kLocal)
         url = EConfigStrings.kRequestLocalDbKeyUrl;
      else
         url = EConfigStrings.kRequestDbKeyUrl;
      
      let self = this;

      // Set a timer to invalidate the key every 15 mins.
      // This well below the Mongo limit of 30 mins, foces us to keep refreshing
      if (!self._timer) {
         self._timer = setInterval(() => { 
            self._dbkey = undefined;
         }, 15*60*60*1000);         
      }

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
            reject(undefined);   
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
               'Authorization': `Bearer ${key}`,
               "Content-Type": "application/ejson",                  
               "Accept": "application/json",
            }              
         })
         .then((resp : any) => {

            resolve(true);
         })
         .catch((error: any) => {   

            logDbError ("Error calling database:", error);   
            reject(false);     
         });  
      });
   
      return done;
   }

   async loadRecent (count : number) : Promise<Array<ActivityRecord>> {
      
      let self = this;

      if (!self._dbkey) {
         await self.connect(self._joinKey);
      }

      let done = new Promise<Array<ActivityRecord>>(function(resolve, reject) {

         let key = self._dbkey;

         axios.post('https://eu-west-1.aws.data.mongodb-api.com/app/braidlmsclient-fsivu/endpoint/data/v1/action/find', 
         {   
            "dataSource": "mongodb-atlas",
            "database": "BraidLms",
            "collection": "Activity",
            "sort": { "happenedAt": -1 },
            "limit": count     
          },
          {
             headers: {                  
               "Content-Type": "application/ejson",                  
               "Accept": "application/json",
               'Authorization': `Bearer ${key}`               
            }              
         })
         .then((resp : any) => {

            let responseRecords = resp.data.documents;
            let records = new Array<ActivityRecord>();

            for (let i = 0; i < responseRecords.length; i++) {
               let record = new UrlActivityRecord(responseRecords[i]._id,
                  responseRecords[i].email, 
                  responseRecords[i].happenedAt, 
                  responseRecords[i].url);
               records.push (record);
            }

            resolve(records);
         })
         .catch((error: any) => {   

            logDbError ("Error calling database:", error);   
            resolve(new Array<ActivityRecord> ());     
         });  
      });
   
      return done;
   }

}
