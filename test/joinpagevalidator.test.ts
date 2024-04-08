'use strict';
// Copyright Braid Technologies ltd, 2024
import { expect } from 'expect';
import { describe, it } from 'mocha';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { SessionKey, ConversationKey } from '../core/Keys';
import { JoinDetails } from '../core/JoinDetails';
import { JoinPageValidator } from '../core/JoinPageValidator';

import axios from "axios";

const badUuid = "9a0583f5xca56-421b-8545-aa23032d6c93"

var keyGenerator: IKeyGenerator = new UuidKeyGenerator();

describe("JoinPageValidator", function () {

   it("Needs to detect invalid name", function () {

      let validator = new JoinPageValidator();
      let session = new SessionKey (keyGenerator.generateKey());
      let conversation = new ConversationKey (keyGenerator.generateKey());

      expect(validator.isJoinAttemptReady ("", session, conversation)).toEqual(false);
   });

   it("Needs to detect invalid session key", function () {

      let validator = new JoinPageValidator();
      let session = new SessionKey (badUuid);
      let conversation = new ConversationKey (keyGenerator.generateKey());

      expect(validator.isJoinAttemptReady ("joe@mail.com", session, conversation)).toEqual(false);
   }); 

   it("Needs to detect invalid conversation key", function () {

      let validator = new JoinPageValidator();
      let session = new SessionKey (keyGenerator.generateKey());
      let conversation = new ConversationKey (badUuid);

      expect(validator.isJoinAttemptReady ("joe@mail.com", session, conversation)).toEqual(false);
   }); 
    

   it("Needs to detect valid components", function () {
      let validator = new JoinPageValidator();
      let session = new SessionKey (keyGenerator.generateKey());
      let conversation = new ConversationKey (keyGenerator.generateKey());

      expect(validator.isJoinAttemptReady ("joe@mail.com", session, conversation)).toEqual(true);
   });
   
});


describe("JoinDetails", function () {

   it("Needs to classify empty string", function () {

      let details = new JoinDetails("");

      expect(details.isValid()).toEqual(false);
   });

   it("Needs to detect invalid name", function () {

      let name = "";
      let session = new SessionKey (keyGenerator.generateKey());
      let conversation = new ConversationKey (keyGenerator.generateKey());

      let details = new JoinDetails ("&email=" + name + "&session=" + session.toString() + "&conversation=" + conversation.toString());

      expect(details.isValid()).toEqual(false);
   });

   it("Needs to detect invalid session key", function () {

      let name = "joe@mail.com";
      let session = new SessionKey (badUuid);
      let conversation = new ConversationKey (keyGenerator.generateKey());

      let details = new JoinDetails ("&email=" + name + "&session=" + session.toString() + "&conversation=" + conversation.toString());

      expect(details.isValid()).toEqual(false);
   }); 

   it("Needs to detect invalid conversation key", function () {

      let name = "joe@mail.com";
      let session = new SessionKey (keyGenerator.generateKey());
      let conversation = new ConversationKey (badUuid);

      let details = new JoinDetails ("&email=" + name + "&session=" + session.toString() + "&conversation=" + conversation.toString());

      expect(details.isValid()).toEqual(false);
   });  
   
   it("Needs to detect all valid parts", function () {

      let name = "joe@mail.com";
      let session = new SessionKey (keyGenerator.generateKey());
      let conversation = new ConversationKey (keyGenerator.generateKey());

      let details = new JoinDetails ("&email=" + name + "&session=" + session.toString() + "&conversation=" + conversation.toString());

      expect(details.isValid()).toEqual(true);
   });     
});