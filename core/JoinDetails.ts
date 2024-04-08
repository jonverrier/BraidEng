// Copyright (c) 2024 Braid Technologies Ltd
import { EConfigStrings } from "./ConfigStrings";
import { SessionKey, ConversationKey } from "./Keys";
import { Environment, EEnvironment } from './Environment';

var qs = require('qs');

function validateEmail(email_: string) : boolean {
   if (!email_)
      return false;

   const res = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
   return res.test(String(email_).toLowerCase());
 }

export class JoinDetails {

   private _email: string;
   private _session: SessionKey;
   private _conversation: ConversationKey;   

   /**
    * Create a JoinDetails object. A join details is in the format 'email=xxx@yyy.com&session=guid&conversation=guid' . The email is used to uniquely identify the joiner, the session 
    * specifies a key to use for basic security, conversation is a Fluid UUID
    * It can be valid with a string that looks like an email address, and a session and conversation keys that look like UUIDs
    */
   constructor(trialInput_: string) {
   
      this._session = new SessionKey("");
      this._conversation = new ConversationKey("");      
      this._email = "";

      let parsed = qs.parse (trialInput_); 

      this._email = parsed.email ? parsed.email : "";
      this._session = parsed.session ? new SessionKey (parsed.session) : new SessionKey ("");
      this._conversation = parsed.conversation ? new ConversationKey (parsed.conversation) : new ConversationKey ("");  
   }   
   
   /**
   * set of 'getters' for private variables
   */
   get email(): string  {
      return this._email;
   }
   get session(): SessionKey  {
      return this._session;
   }
   get conversation(): ConversationKey  {
      return this._conversation;
   }   
   toString(): string  {
      return JoinDetails.toString (this._email, this._session, this._conversation);
   }

   isValid(): boolean {
      let environment = Environment.environment();

      // If we are running locally, allow empty conversation key -> this creates a new conversation
      if ((environment === EEnvironment.kLocal) && this._conversation.toString().length === 0)
         return this._session.looksValidSessionKey() && validateEmail (this._email);

      return (this._session.looksValidSessionKey() && this._conversation.looksValidConversationKey() && validateEmail (this._email));          
   } 

   static toString (email_: string, session_: SessionKey, conversation_: ConversationKey) : string {
      return '&' + EConfigStrings.kEmailParamName + '=' +  email_ 
         + '&' + EConfigStrings.kSessionParamName + '=' + session_.toString() 
         + '&' + EConfigStrings.kConversationParamName + '=' + conversation_.toString();
   }

   static makeFromParts (email_: string, session_: SessionKey, conversation_: ConversationKey) {

      return new JoinDetails (JoinDetails.toString (email_, session_, conversation_));
   }
  
}