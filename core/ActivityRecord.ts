// Copyright (c) 2024 Braid Technologies Ltd

import { InvalidParameterError } from './Errors';
import { throwIfUndefined } from './Asserts'; 
import { MDynamicStreamable, DynamicStreamableFactory } from "./StreamingFramework";

const className = "ActivityRecord";


// Persona - aggregates name, icon type, & timestamp of last time we saw them
// excludes email and other PII so can be passed to client even when describing an individual.
export class ActivityRecord extends MDynamicStreamable {
   private _id: string | undefined;
   private _email: string;
   private _happenedAt: Date;

   /**
    * Create an empty ActivityRecord object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a ActivityRecord object
    * @param id_ - id to use to generate uniqueness 
    * @param email_ - plain text email.
    * @param happenedAt_ - timestamp for last interaction seen by the framework
    */
   public constructor(id_: string | undefined, email_: string, happenedAt_: Date);

   /**
    * Create a ActivityRecord object
    * @param activityRecord - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(activityRecord: ActivityRecord);

   public constructor(...arr: any[])
   {

      super();

      if (arr.length === 0) {
         this._id = undefined; // A new ActivityRecord has no key as that is assgned in the DB 
         this._email = "";     // But not a name 
         this._happenedAt = new Date();
         return;
      }

      var localId: string;
      var localEmail: string;
      var localHappenedAt: Date;

      if (arr.length === 1) {
         localId = arr[0]._id
         localEmail = arr[0]._email;
         localHappenedAt = new Date(arr[0]._happenedAt);
      }
      else { 
         localId = arr[0];
         localEmail = arr[1];
         localHappenedAt = new Date (arr[2]);
      }

      if (!ActivityRecord.isValidId(localId)) {
         throw new InvalidParameterError("Id:" + localId + '.');
      }      
      if (!ActivityRecord.isValidEmail(localEmail)) {
         throw new InvalidParameterError("Email:" + localEmail + '.');
      }

      this._id = localId;
      this._email = localEmail;
      this._happenedAt = localHappenedAt;
   }

   /**
    * Dynamic creation for Streaming framework
    */
   className(): string {

      return className;
   }

   static createDynamicInstance(): MDynamicStreamable {
      return new ActivityRecord();
   }

   static _dynamicStreamableFactory: DynamicStreamableFactory = new DynamicStreamableFactory(className, ActivityRecord.createDynamicInstance);
   streamOut(): string {

      return JSON.stringify({ id: this._id, email: this._email, happenedAt: this._happenedAt });
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      this.assign(new ActivityRecord (obj.id, obj.email, new Date(obj.happenedAt)));
   }

   /**
   * set of 'getters' for private variables
   */
   get id(): string | undefined {
      return this._id;
   }
   get email(): string {
      return this._email;
   }
   get happenedAt(): Date {
      return this._happenedAt;
   }

   /**
   * set of 'setters' for private variables
   */
   set id(id_: string) {

      if (!ActivityRecord.isValidId(id_)) {
         throw new InvalidParameterError("Id:" + id_ + '.');
      }         
      this._id = id_;
   }

   set email (email_: string) {
      if (!ActivityRecord.isValidEmail(email_)) {
         throw new InvalidParameterError("Email:" + email_ + '.');
      }

      this._email = email_;
   }

   set happenedAt(happenedAt_: Date) {

      this._happenedAt = new Date(happenedAt_);
   }

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: ActivityRecord): boolean {
      return ((((typeof this._id === "undefined") && (typeof rhs._id === "undefined")) || (this._id === rhs._id)) &&
         (this._email === rhs._email) &&
         (this.areSameDate (this._happenedAt, rhs._happenedAt)));
   }

   areSameDate (lhs: Date, rhs : Date) : boolean {
      if (lhs.getTime() === rhs.getTime()) {
         return true;
      }
      return false;
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: ActivityRecord): ActivityRecord {
      this._id = rhs._id;
      this._email = rhs._email;
      this._happenedAt = new Date (rhs._happenedAt);

      return this;
   }

   /**
    * test for valid id 
    * @param id - the string to test
    */
   static isValidId(id_: string): boolean {
      if (!id_) // undefined keys are allowed if user object has not been originated from or saved anywhere persistent
         return true;

      if (id_ && id_.length > 0) // if the id exists, must be > zero length
         return true;

      return (false);
   }

   /**
    * test for valid name 
    * @param name - the string to test
    */
   static isValidEmail(email: string): boolean {

      if (email == undefined)
         return false;

      return true; // Currently allow anything for a name, even empty string. 
   }
}
