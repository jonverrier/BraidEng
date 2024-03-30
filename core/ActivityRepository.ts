// Copyright (c) 2024 Braid Technologies Ltd

// 3rd party imports
//import * as Realm from "realm-web";
//const {
//   BSON: { ObjectId },
// } = Realm;
import axios from "axios";


// Internal imports
import { throwIfNull } from "./Asserts";
import { logDbError } from "./Logging";
import { ActivityRecord } from './ActivityRecord';

export interface IActivityRepository {

   save (record : ActivityRecord) : Promise<boolean>;


}

export function getRecordRepository () : IActivityRepository {
   return new ActivityRepository();   
}

// ActivityRecord - email of a person and a datestamp. Will have many derived classes according to different activity types. 
export class ActivityRepository implements IActivityRepository {

   /**
    * Create an empty ActivityRepository object - required for particiation in serialisation framework
    */
   public constructor() {

   }

   async save (record : ActivityRecord) : Promise<boolean> {
      
      let done = new Promise<boolean>(function(resolve, reject) {

         let stream = record.streamOut ();
         let document = JSON.parse(stream);

         axios.post('https://eu-west-1.aws.data.mongodb-api.com/app/braidlmsclient-fsivu/endpoint/data/v1/action/insertOne', 
         {   
            "dataSource": "mongodb-atlas",
            "database": "BraidLms",
            "collection": "Activity",
            "document": document
          },
          {
             headers: {                  
               "apiKey": "IcFsSMgxqWvxZceSM7i73Vpalxf2vpfiJQXBb3HpOg7KkL82QIL5EINDLsfak2GS",
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
