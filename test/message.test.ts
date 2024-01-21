'use strict';
// Copyright TXPCo ltd, 2021
import { MDynamicStreamable } from '../core/StreamingFramework';
import { Message} from '../core/Message';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';

import { expect } from 'expect';
import { describe, it } from 'mocha';

var keyGenerator: IKeyGenerator = new UuidKeyGenerator();

var myId: string = "1234";
var myAuthorId: string = "Jon";
var myResponseToId: string = "abcd";
var myText = "Hello";
var mySentAt = new Date();

var someoneElsesId: string = "5678";
var someoneElsesAuthorId: string = "Barry";
var someoneElsesResponseTo: string = "abcdefgh";
var someoneElsesText = "Bye";
var someoneElsesSentAt = new Date(0);

describe("Message", function () {

   var message1: Message, message2: Message, messageErr:Message;

   message1 = new Message(myId, myAuthorId, myResponseToId, myText, mySentAt);

   message2 = new Message(someoneElsesId, someoneElsesAuthorId, someoneElsesResponseTo, someoneElsesText, someoneElsesSentAt);

   it("Needs to construct an empty object", function () {

      var messageEmpty = new Message();

      expect(messageEmpty.text).toEqual("");
      expect(messageEmpty.responseToId).toEqual(undefined);
      expect(keyGenerator.couldBeAKey (messageEmpty.id)).toEqual(true);      
   });

   it("Needs to allow undefined ID", function () {

      var caught: boolean = false;
      try {
         messageErr = new Message(undefined, myId, myResponseToId, myText, mySentAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(false);
   });

   it("Needs to detect invalid ID", function () {

      var caught: boolean = false;
      try {
         messageErr = new Message(1 as unknown as string, myId, myResponseToId, myText,  mySentAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });


   it("Needs to compare for equality and inequality", function () {

      var messageNew: Message = new Message(message1.id, message1.authorId, message1.responseToId, message1.text, message1.sentAt);

      expect(message1.equals(message1)).toEqual(true);
      expect(message1.equals(messageNew)).toEqual(true);
      expect(message1.equals(message2)).toEqual(false);
   });
   
   
   it("Needs to detect inequality on date", function () {

      var messageNew: Message = new Message(message1.id, message1.authorId, message1.responseToId, message1.text, new Date());

      expect(message1.equals(messageNew)).toEqual(false);
   });

   it("Needs to throw error if checkedResponseToId is not satisfied", function () {

      var messageEmpty = new Message();

      var caught: boolean = false;
      try {
         let thumb = messageEmpty.checkedResponseToId;

      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });

   it("Needs to correctly store attributes", function () {
         
      expect(message1.authorId === myAuthorId).toEqual(true);
      expect(message1.responseToId === myResponseToId).toEqual(true);
      expect(message1.sentAt.getTime() === mySentAt.getTime()).toEqual(true);
   });

   it("Needs to copy construct", function () {

      let persona2: Message = new Message(message1);

      expect(message1.equals(persona2) === true).toEqual(true);
   });

   it("Needs to correctly change attributes", function () {

      var messageNew: Message = new Message(message1.id, message1.authorId, message1.responseToId, message1.text, message1.sentAt);

      messageNew.id = someoneElsesId;
      messageNew.text = someoneElsesText;
      messageNew.authorId = someoneElsesAuthorId;
      messageNew.responseToId = someoneElsesResponseTo;
      messageNew.sentAt = someoneElsesSentAt;

      expect(message2.equals (messageNew)).toEqual(true);
   });

   it("Needs to catch errors on change id attributes", function () {

      var caught: boolean = false;
      try {
         message1.id = 1 as unknown as string;
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });

   it("Needs to convert to and from JSON()", function () {

      var stream: string = message1.streamOut();

      var messageNew: Message = new Message(message1.id, message1.authorId, message1.responseToId, message1.text, message1.sentAt);
      messageNew.streamIn(stream);

      expect(message1.equals(messageNew)).toEqual(true);
   });

   it("Needs to dynamically create Message to and from JSON()", function () {

      var stream: string = message1.flatten();

      var messageNew: Message = new Message();

      expect(message1.equals(messageNew)).toEqual(false);

      messageNew = MDynamicStreamable.resurrect(stream) as Message;

      expect(message1.equals(messageNew)).toEqual(true);
   });

});
