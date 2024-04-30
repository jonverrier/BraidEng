// Copyright (c) 2024 Braid Technologies Ltd

// 3rd party imports
import axios from "axios";
import { DefaultAzureCredential, ClientSecretCredential } from "@azure/identity";
import { CosmosClient } from '@azure/cosmos';

// Internal imports
import { Environment, EEnvironment } from "./Environment";
import { EConfigStrings } from "./ConfigStrings";
import { KeyRetriever } from "./KeyRetriever";
import { logDbError, logApiError } from "./Logging";
import { ActivityRecord } from './ActivityRecord';
import { UrlActivityRecord } from "./UrlActivityRecord";
import { SessionKey } from "./Keys";
import { IActivityRepository } from "./IActivityRepository";
import { throwIfUndefined } from "./Asserts";

const partitionKey = "6ea3299d987b4b33a1c0b079a833206f";

var crypto = require("crypto");  
  
function getAuthorizationTokenUsingMasterKey(verb: string, resourceType: string, resourceId: string, date: string, masterKey: string) {  

    var key = Buffer.from(masterKey, "base64");  
  
    var text = (verb || "").toLowerCase() + "\n" +   
               (resourceType || "").toLowerCase() + "\n" +   
               (resourceId || "") + "\n" +   
               date.toLowerCase() + "\n" +   
               "" + "\n";  
  
    var body = Buffer.from(text, "utf8");  
    var signature = crypto.createHmac("sha256", key).update(body).digest("base64");  
  
    var MasterToken = "master";  
  
    var TokenVersion = "1.0";  
  
    var encoded = encodeURIComponent("type=" + MasterToken + "&ver=" + TokenVersion + "&sig=" + signature);  

    return encoded;
}

function activityToken(verb: string, time: string) { 

   let key = process.env.CosmosApiKey;
   throwIfUndefined(key);
   return getAuthorizationTokenUsingMasterKey( verb, "docs", "dbs/BraidLms/colls/Activity", time, 
                                               key);
}

function postActivityToken(time: string) { 

   return activityToken( "post", time);
}

function getActivityToken(time: string) { 

   return activityToken( "get", time);
}

// ActivityRecord - email of a person and a datestamp. Will have many derived classes according to different activity types. 
export class ActivityRepositoryCosmos implements IActivityRepository {

   private _dbkey: string | undefined;
   private _sessionKey: SessionKey;
   private _timer: NodeJS.Timeout | undefined;

   /**
    * Create an ActivityRepository object 
    * @param sessionKey_ - joining key
    */
   public constructor(sessionKey_: SessionKey) {

      this._dbkey = undefined;
      this._sessionKey = sessionKey_;
      this._timer = undefined;
   }

   disConnect () : void {
      if (this._timer) {
         clearInterval(this._timer);
         this._timer = undefined;
      }
   }

   async connect (sessionKey_ : SessionKey) : Promise<string | undefined> {
      let retriever = new KeyRetriever();
      var url: string;

      if (Environment.environment() === EEnvironment.kLocal)
         url = EConfigStrings.kRequestLocalCosmosDbKeyUrl;
      else
         url = EConfigStrings.kRequestCosmosDbKeyUrl;
      
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
            EConfigStrings.kSessionParamName, 
            sessionKey_)
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
         await self.connect(self._sessionKey);
      }    

      let done = new Promise<boolean>(function(resolve, reject) {

         let time = new Date().toUTCString();
         let stream = record.streamOut ();
         let document = JSON.parse(stream);
         let key = postActivityToken(time); // self._dbkey;

         let obj = {
            id: "1234",
            partition: "1234"
         };

         axios.post('https://braidlms.documents.azure.com/dbs/BraidLms/colls/Activity/docs', 
         obj,
         {
            headers: {                  
               "Authorization": key,
               "Content-Type": "application/json",    
               "Accept": "application/json",               
               "x-ms-date": time,
               "x-ms-version" : "2018-12-31",
               "Cache-Control": "no-cache",
               "x-ms-documentdb-is-upsert" : "True",
               "x-ms-documentdb-partitionkey" : "[\"1234\"]",
               "x-ms-consistency-level" : "Eventual"
            }              
         })
         .then((resp : any) => {

            console.log (resp.data);
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
         await self.connect(self._sessionKey);
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
