// Copyright (c) 2024 Braid Technologies Ltd
import { SessionKey, ConversationKey } from "./Keys";
import { JoinDetails } from "./JoinDetails";

export class JoinPageValidator {

   /**
    * Create an empty JoinPageValidator object 
    */
   constructor() {
   }   

   // Looks at the name and keys provided, and returns true if the data looks ready to join a conversation, else false.
   isJoinAttemptReady  (email_: string, session_: SessionKey, conversation_: ConversationKey) : boolean {

      let details = JoinDetails.makeFromParts (email_, session_, conversation_);    

      return details.isValid();
   }
}