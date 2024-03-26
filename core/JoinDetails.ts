// Copyright (c) 2024 Braid Technologies Ltd
import { EConfigStrings } from "./ConfigStrings";
import { JoinPath } from "./JoinPath";
var qs = require('qs');

function validateEmail(email_: string) : boolean {
   if (!email_)
      return false;

   const res = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
   return res.test(String(email_).toLowerCase());
 }

export class JoinDetails {

   private _isValid: boolean;
   private _email: string;
   private _joinPath: JoinPath;

   /**
    * Create a JoinDetails object. A join details is in the format 'email=xxx@yyy.com&joinpath=guid/guid' . The email is used to uniquely identify the joiner, and the joinpath 
    * specifies a key to use for basic security and a path to the actual conversation (a Fluid UUID)
    * It can be valid with a string that looks like an email address, and a joinkey that is either partically specifiied (key only) or full specified (join key + IS for container)
    */
   constructor(trialInput_: string) {

      this._isValid = false;        
      this._joinPath = new JoinPath("");
      this._email = "";

      let parsed = qs.parse (trialInput_); 

      this._email = parsed.email ? parsed.email : "";
      this._joinPath = parsed.joinpath ? new JoinPath (parsed.joinpath) : new JoinPath ("");

      this._isValid = this._joinPath.isValid && validateEmail (this._email);    
   }   
   
   /**
   * set of 'getters' for private variables
   */
   get isValid(): boolean {
      return this._isValid;
   } 
   get email(): string  {
      return this._email;
   }
   get joinPath(): JoinPath  {
      return this._joinPath;
   }
   get asString(): string  {
      return JoinDetails.makeAsString (this._email, this._joinPath);
   }

   static makeAsString (email_: string, joinPath_: JoinPath) : string {
      return '&' + EConfigStrings.kEmailParamName + '=' +  email_ + '&' + EConfigStrings.kJoinPathParamName + '=' + joinPath_.asString;
   }

   static makeFromTwoParts (email_: string, joinPath_: JoinPath) {

      return new JoinDetails (JoinDetails.makeAsString (email_, joinPath_));
   }
  
}