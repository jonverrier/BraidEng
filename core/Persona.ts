// Copyright (c) 2023 TXPCo Ltd

import { InvalidParameterError } from './Errors';
import { EIcon } from './Icons';
import { throwIfUndefined } from './Asserts'; 
import { MDynamicStreamable, DynamicStreamableFactory } from "./StreamingFramework";
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';

var keyGenerator: IKeyGenerator = new UuidKeyGenerator();

const unknowUuid: string = "88a77968-2525-4b83-b396-352ca83d1680";

const className = "Persona";


// atob works in a browser, implement a fallback if we are in node. 
function callAtob(data_: string, forceShim: boolean): string {

   if (!atob || forceShim) {
      const atob = (data: string) => Buffer.from(data, 'base64').toString('binary');
      return atob(data_);
   }
   return atob(data_);
}

// Persona - aggregates name, icon type, & timestamp of last time we saw them
// excludes email and other PII so can be passed to client even when describing an individual.
export class Persona extends MDynamicStreamable {
   private _id: string;
   private _name: string;
   private _icon: EIcon;
   private _thumbnailB64: string | undefined;
   private _lastSeenAt: Date;

   /**
    * Create an empty Persona object - required for particiation in serialisation framework
    */
   public constructor();

   /**
    * Create a Persona object
    * @param id_ - id to use to generate uniqueness 
    * @param name_ - plain text user name.
    * @param icon_ - icon to use, from the enum list
    * @param thumbNailB64_ - encoded thumbnail image, can be undefined
    * @param lastSeenAt_ - timestamp for last interaction seen by the framework
    */
   public constructor(id_: string | undefined, name_: string | undefined, icon: EIcon, thumbNailB64_: string | undefined, lastSeenAt_: Date);

   /**
    * Create a Persona object
    * @param persona - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(persona: Persona);

   public constructor(...arr: any[])
   {

      super();

      if (arr.length === 0) {
         this._id = keyGenerator.generateKey(); // An new Person has a key
         this._name = "";                       // But not a name 
         this._icon = EIcon.kUnknownPersona;
         this._thumbnailB64 = undefined;
         this._lastSeenAt = new Date();
         return;
      }

      var localId: string;
      var localName: string;
      var localIcon: EIcon;
      var localThumbNailB64: string;
      var localLastSeenAt: Date;

      if (arr.length === 1) {
         localId = arr[0]._id
         localName = arr[0]._name;
         localIcon = arr[0]._icon;
         localThumbNailB64 = arr[0]._thumbnailB64;
         localLastSeenAt = new Date(arr[0]._lastSeenAt);
      }
      else { 
         localId = arr[0];
         localName = arr[1];
         localIcon = arr[2];         
         localThumbNailB64 = arr[3];
         localLastSeenAt = new Date (arr[4]);
      }

      if (!Persona.isValidId(localId)) {
         throw new InvalidParameterError("Id:" + localId + '.');
      }
      if (!Persona.isValidName(localName)) {
         throw new InvalidParameterError("Name:" + localName + '.');
      }
      if (!Persona.isValidThumbnailB64(localThumbNailB64)) {
         throw new InvalidParameterError("Thumbnail:" + localThumbNailB64 + '.');
      }

      this._id = localId;
      this._name = localName;
      this._icon = localIcon;
      this._thumbnailB64 = localThumbNailB64;
      this._lastSeenAt = localLastSeenAt;
   }

   /**
    * Dynamic creation for Streaming framework
    */
   className(): string {

      return className;
   }

   static createDynamicInstance(): MDynamicStreamable {
      return new Persona();
   }

   static _dynamicStreamableFactory: DynamicStreamableFactory = new DynamicStreamableFactory(className, Persona.createDynamicInstance);
   streamOut(): string {

      return JSON.stringify({ id: this._id, name: this._name, icon: this._icon, thumbnailB64: this._thumbnailB64, lastSeenAt: this._lastSeenAt });
   }

   streamIn(stream: string): void {

      const obj = JSON.parse(stream);

      const icon: EIcon = ((EIcon as any)[obj.icon]);
      if (icon === undefined)
         throw new InvalidParameterError("Icon:" + obj.icon + '.');

      this.assign(new Persona (obj.id, obj.name, icon, obj.thumbnailB64, new Date(obj.lastSeenAt)));
   }

   /**
   * set of 'getters' for private variables
   */
   get id(): string {
      return this._id;
   }
   get name(): string {
      return this._name;
   }
   get icon(): EIcon {
      return this._icon;
   }
   get thumbnailB64(): string | undefined {
      return this._thumbnailB64;
   }
   get lastSeenAt(): Date {
      return this._lastSeenAt;
   }
   get checkedThumbnailB64(): string {
      throwIfUndefined (this._thumbnailB64);        
      return this._thumbnailB64;
   }

   /**
   * set of 'setters' for private variables
   */
   set id(id_: string) {
      if (!Persona.isValidId(id_)) {
         throw new InvalidParameterError("Id:" + id_ + '.');
      }

      this._id = id_;
   }

   set name(name_: string) {
      if (!Persona.isValidName(name_)) {
         throw new InvalidParameterError("Name:" + name_ + '.');
      }

      this._name = name_;
   }

   set icon (icon_: EIcon) {

      this._icon = icon_;
   }

   set thumbnailB64(thumbNailB64_: string) {

      this.setThumbnailB64(thumbNailB64_);
   }

   set lastSeenAt(lastSeenAt_: Date) {

      this._lastSeenAt = new Date(lastSeenAt_);
   }

   /**
    * test for equality - checks all fields are the same. 
    * Uses field values, not identity bcs if objects are streamed to/from JSON, field identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: Persona): boolean {
      Persona
      return ((this._id === rhs._id) &&
         (this._name === rhs._name) &&
         (this._icon === rhs._icon) &&         
         ((this._thumbnailB64 === undefined && rhs._thumbnailB64 == undefined) || (this._thumbnailB64 === rhs._thumbnailB64)) &&
         (this.areSameDate (this._lastSeenAt, rhs._lastSeenAt)));
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
   assign(rhs: Persona): Persona {
      this._id = rhs._id;
      this._name = rhs._name;
      this._icon = rhs._icon;
      this._thumbnailB64 = rhs._thumbnailB64;
      this._lastSeenAt = new Date (rhs._lastSeenAt);

      return this;
   }

   /**
    * Set thumbnail with an option to force use of browser shim for B64 encoding 
    */
   setThumbnailB64(thumbNailB64_: string, forceShim_: boolean = false) : void {

      if (!Persona.isValidThumbnailB64(thumbNailB64_, forceShim_)) {
         throw new InvalidParameterError("Thumbnail:" + thumbNailB64_ + '.');
      }

      this._thumbnailB64 = thumbNailB64_;
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
   static isValidName(name_: string): boolean {
      if (name_ && name_.length > 0)
         return true;

      return (false);
   }

   /**
    * test for valid thumbnail string 
    * @param thumbnail - the string to test
    */
   static isValidThumbnailB64(thumbNailB64_: string, forceShim_: boolean = false): boolean {


      if (thumbNailB64_ == undefined) // Thumbnail can be undefined it its a predefined ICON
         return true;

      // else must be a valid encoded string
      if (thumbNailB64_.length > 0) { 

         var decoded = undefined;

         try {
            decoded = callAtob(thumbNailB64_, forceShim_);
         } catch (e) {
            // OK to fall through after supressing exception as decoded will be undefined.             
         }
         if (!decoded)
            return false;

         return true;
      }

      return (false);
   }

   private static _unknown: Persona = new Persona(unknowUuid, "Guest", EIcon.kUnknownPersona, undefined, new Date(0));

   /**
    * return persona details for 'unknown'
    */
   static unknown(): Persona {
      return Persona._unknown;
   }


   /**
    * test if the persona details are the status 'unknown'
    * @param persona - the persona to test 
    */
   static isUnknown(persona: Persona): boolean {
      return (persona === Persona._unknown) ||
         (persona && persona.equals(Persona._unknown));
   }
}
