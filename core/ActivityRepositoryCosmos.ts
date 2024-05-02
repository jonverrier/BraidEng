// Copyright (c) 2024 Braid Technologies Ltd

// 3rd party imports
import axios from "axios";

// Internal imports
import { throwIfUndefined } from "./Asserts";
import { InvalidParameterError } from "./Errors";
import { Environment, EEnvironment } from "./Environment";
import { EConfigStrings } from "./ConfigStrings";
import { KeyRetriever } from "./KeyRetriever";
import { logDbError, logApiError } from "./Logging";
import { DynamicStreamableFactory } from "./StreamingFramework";
import { ActivityRecord } from './ActivityRecord';
import { UrlActivityRecord } from "./UrlActivityRecord";
import { MessageActivityRecord } from "./MessageActivityRecord";
import { SessionKey } from "./Keys";
import { IActivityRepository } from "./IActivityRepository";

const defaultPartitionKey = "6ea3299d987b4b33a1c0b079a833206f";

var crypto = require("crypto-browserify");  
export var stream = require("stream-browserify");  

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

function activityToken(verb: string, time: string, key: string) { 

   throwIfUndefined(key);
   return getAuthorizationTokenUsingMasterKey( verb, "docs", "dbs/BraidLms/colls/Activity", time, 
                                               key);
}

function makePostActivityToken(time: string, key: string) { 

   return activityToken( "post", time, key);
}

function makeGetActivityToken(time: string, key: string) { 

   return activityToken( "get", time, key);
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
         let stream = record.flatten ();
         let document = JSON.parse(stream);
         document.data = JSON.parse(document.data);

         throwIfUndefined(self._dbkey); // Keep compiler happy, should not be able to get here with actual undefined key. 
         let key = makePostActivityToken(time, self._dbkey); 

         document.partition = defaultPartitionKey; // Dont need real partitions until 10 GB ... 
         document.id = document.data.id; // Need to copy ID up from activity object, since MDynamicallyStreamable streams only the class name. 

         axios.post('https://braidlms.documents.azure.com/dbs/BraidLms/colls/Activity/docs', 
         document,
         {
            headers: {                  
               "Authorization": key,
               "Content-Type": "application/json",    
               "Accept": "application/json",               
               "x-ms-date": time,
               "x-ms-version" : "2018-12-31",
               "Cache-Control": "no-cache",
               "x-ms-documentdb-is-upsert" : "True",
               "x-ms-documentdb-partitionkey" : "[\"" + defaultPartitionKey + "\"]", 
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

   async loadRecentUrlActivity (count : number) : Promise<Array<ActivityRecord>> {
      return this.loadRecent (count, UrlActivityRecord.className());
   }

   async loadRecentMessages (count : number) : Promise<Array<ActivityRecord>> {
      return this.loadRecent (count, MessageActivityRecord.className());
   }

   createFromDb (record: any) : ActivityRecord {

      switch (record.className) {
         case UrlActivityRecord.className():
            return new UrlActivityRecord(record.id,
               record._conversationId,
               record.data.email, 
               record.data.happenedAt, 
               record.data.url);

         case MessageActivityRecord.className():
            return new MessageActivityRecord(record.id,
               record._conversationId,
               record.data.email, 
               record.data.happenedAt, 
               record.data.message);   
               
         default:
            throw new InvalidParameterError(record);
      }
   }

   async loadRecent (count : number, className: string) : Promise<Array<ActivityRecord>> {
      
      let self = this;

      if (!self._dbkey) {
         await self.connect(self._sessionKey);
      }

      let done = new Promise<Array<ActivityRecord>>(function(resolve, reject) {

         let time = new Date().toUTCString();
         throwIfUndefined(self._dbkey); // Keep compiler happy, should not be able to get here with actual undefined key. 
         let key = makePostActivityToken(time, self._dbkey);         
         let query = "SELECT * FROM Activity a WHERE a.className = @className ORDER BY a.happenedAt DESC OFFSET 0 LIMIT " + count.toString();

         axios.post('https://braidlms.documents.azure.com/dbs/BraidLms/colls/Activity/docs', 
         {
            "query": query,  
            "parameters": [  
              {  
                "name": "@className",  
                "value": className
              }
            ]  
         },
         {
            headers: {                  
               "Authorization": key,
               "Content-Type": "application/query+json",    
               "Accept": "application/json",               
               "x-ms-date": time,
               "x-ms-version" : "2018-12-31",
               "Cache-Control": "no-cache",
               "x-ms-documentdb-partitionkey" : "[\"" + defaultPartitionKey + "\"]", 
               "x-ms-consistency-level" : "Eventual",
               "x-ms-documentdb-isquery" : "True"
            }              
         })
         .then((resp : any) => {

            console.log (resp.data);

            let responseRecords = resp.data.Documents;
            let records = new Array<ActivityRecord>();

            for (let i = 0; i < responseRecords.length; i++) {

               let obj = self.createFromDb (responseRecords[i]);
               records.push (obj);
            }

            resolve(records);
         })
         .catch((error: any) => {   

            logDbError ("Error calling database:", error);   
            reject(new Array<ActivityRecord> ());     
         });  
      });
   
      return done;
   }

}
