'use strict';
// Copyright TXPCo ltd, 2021
import { MDynamicStreamable } from '../core/StreamingFramework';
import { Persona} from '../core/Persona';
import { EIcon } from '../core/Icons';

import { expect } from 'expect';
import { describe, it } from 'mocha';


var myId: string = "1234";
var myName: string = "Jon";
var myThumbnail: string = "abcd";
var myLastSeenAt = new Date();

var someoneElsesId: string = "5678";
var someoneElsesName: string = "Barry";
var someoneElsesThumbnail: string = "abcdefgh";
var someoneElsesLastSeenAt = new Date(0);

describe("Persona", function () {

   var persona1: Persona, persona2: Persona, personaErr:Persona;

   persona1 = new Persona(myId, myName, EIcon.kPersonPersona, myThumbnail, myLastSeenAt);

   persona2 = new Persona(someoneElsesId, someoneElsesName, EIcon.kPersonPersona, someoneElsesThumbnail, someoneElsesLastSeenAt);

   it("Needs to construct an empty object", function () {

      var personaEmpty = new Persona();

      expect(personaEmpty.id).toEqual(undefined);
   });

   it("Needs to allow undefined ID", function () {

      var caught: boolean = false;
      try {
         var personaErr: Persona = new Persona(undefined, myId, EIcon.kPersonPersona, myThumbnail, myLastSeenAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(false);
   });

   it("Needs to detect invalid ID", function () {

      var caught: boolean = false;
      try {
         var personaErr: Persona = new Persona(1 as unknown as string, myId, EIcon.kPersonPersona, myThumbnail, myLastSeenAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });

   it("Needs to detect invalid name", function () {

      var caught: boolean = false;
      try {
         var personaErr: Persona = new Persona(myId, undefined, EIcon.kPersonPersona, myThumbnail, myLastSeenAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });

   it("Needs to detect invalid thumbnail", function () {

      var caught: boolean = false;
      try {
         var personaErr: Persona = new Persona(myId, myName, EIcon.kFromBcd, "", myLastSeenAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });

   it("Needs to compare for equality and inequality", function () {

      var personaNew: Persona = new Persona(persona1.id, persona1.name, EIcon.kPersonPersona, persona1.thumbnailB64, persona1.lastSeenAt);

      expect(persona1.equals(persona1)).toEqual(true);
      expect(persona1.equals(personaNew)).toEqual(true);
      expect(persona1.equals(persona2)).toEqual(false);
   });
   
   it("Needs to correctly store attributes", function () {
         
      expect(persona1.name === myName).toEqual(true);
      expect(persona1.thumbnailB64 === myThumbnail).toEqual(true);
      expect(persona1.lastSeenAt.getTime() === myLastSeenAt.getTime()).toEqual(true);
   });

   it("Needs to copy construct", function () {

      let persona2: Persona = new Persona(persona1);

      expect(persona1.equals(persona2) === true).toEqual(true);
   });

   it("Needs to correctly change attributes", function () {

      var personaNew: Persona = new Persona(persona1.id, persona1.name, EIcon.kPersonPersona, persona1.thumbnailB64, persona1.lastSeenAt);

      personaNew.id = someoneElsesId;
      personaNew.name = someoneElsesName;
      personaNew.thumbnailB64 = someoneElsesThumbnail;
      personaNew.lastSeenAt = someoneElsesLastSeenAt;

      expect(persona2.equals (personaNew)).toEqual(true);
   });

   it("Needs to catch errors on change id attributes", function () {

      var caught: boolean = false;
      try {
         persona1.id = 1 as unknown as string;
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });

   it("Needs to throw errors on change name attribute", function () {

      var caught: boolean = false;
      try {
         persona1.name = "";
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });


   it("Needs to throw errors on change thumbnail attribute using empty string", function () {

      var caught: boolean = false;
      try {
         persona1.thumbnailB64 = "";
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });

   it("Needs to throw errors on change thumbnail attribute using invalid B64 string", function () {

      var caught: boolean = false;
      try {
         persona1.thumbnailB64 = "abcde";
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });

   it("Needs to fall back to browser shim thumbnail attribute ", function () {

      var caught: boolean = false;
      try {
         persona1.setThumbnailB64 ("abcdefgh", true);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(false);

   });

   it("Needs to throw errors when falling back to browser shim thumbnail attribute ", function () {

      var caught: boolean = false;
      try {
         persona1.setThumbnailB64(1 as unknown as string, true);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });

   it("Needs to test unknown status", function () {

      let unknown: Persona = Persona.unknown();
      let unknown2: Persona = new Persona(unknown.id, unknown.name, unknown.icon, unknown.thumbnailB64, unknown.lastSeenAt);

      expect(Persona.isUnknown(unknown)).toEqual(true);
      expect(Persona.isUnknown(unknown2)).toEqual(true);
   });

   it("Needs to convert to and from JSON()", function () {

      var stream: string = persona1.streamOut();

      var personaNew: Persona = new Persona(persona1.id, persona1.name, persona1.icon, persona1.thumbnailB64, persona1.lastSeenAt);
      personaNew.streamIn(stream);

      expect(persona1.equals(personaNew)).toEqual(true);
   });

   it("Needs to dynamically create Persona to and from JSON()", function () {

      var stream: string = persona1.flatten();

      var personaNew: Persona = new Persona();

      expect(persona1.equals(personaNew)).toEqual(false);

      personaNew = MDynamicStreamable.resurrect(stream) as Persona;

      expect(persona1.equals(personaNew)).toEqual(true);
   });

});
