'use strict';
// Copyright Braid Technologies ltd, 2021
import { expect } from 'expect';
import { describe, it } from 'mocha';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { JoinKey } from '../core/JoinKey';
import { JoinPageValidator } from '../core/JoinPageValidator';

import axios from "axios";

const badUuid = "9a0583f5xca56-421b-8545-aa23032d6c93"

var keyGenerator: IKeyGenerator = new UuidKeyGenerator();

describe("JoinPageValidator", function () {

   it("Needs to detect invalid name", function () {

      let validator = new JoinPageValidator();
      let key = new JoinKey (keyGenerator.generateKey() + '/' + keyGenerator.generateKey());

      expect(validator.isJoinAttemptReady ("", key)== false).toEqual(true);
   });

   it("Needs to detect invalid key", function () {

      let validator = new JoinPageValidator();
      let key = new JoinKey (badUuid + '/' + keyGenerator.generateKey())

      expect(validator.isJoinAttemptReady ("", key)== false).toEqual(true);
   }); 

   it("Needs to detect valid name and key", function () {

      let validator = new JoinPageValidator();
      let key = new JoinKey (keyGenerator.generateKey() + '/' + keyGenerator.generateKey());

      expect(validator.isJoinAttemptReady ("Jon", key)== true).toEqual(true);
   }); 
   
});

describe("JoinKey", function () {

   it("Needs to classify empty string", function () {

      let key = new JoinKey("");

      expect(key.isValid == false).toEqual(true);
   });

   it("Needs to detect invalid single part string", function () {

      let key = new JoinKey("a");

      expect(key.isValid == false).toEqual(true);
   }); 

   it("Needs to detect invalid double part string", function () {

      let key = new JoinKey("a/");

      expect(key.isValid == false).toEqual(true);
   }); 

   it("Needs to detect invalid second part string", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinKey(trialInput + '/');

      expect(key.isValid == false).toEqual(true);
   }); 

   it("Needs to detect valid single part string", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinKey(trialInput);

      expect(key.isValid == true).toEqual(true);
      expect(key.isSinglePart == true).toEqual(true);      
      expect(key.isTwoPart == false).toEqual(true); 
      expect(key.firstPart).toEqual(trialInput);   
      expect(key.secondPart).toEqual("");                 
   }); 

   it("Needs to detect valid double part string", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinKey(trialInput + "/" + trialInput);

      expect(key.isValid == true).toEqual(true);
      expect(key.isSinglePart == false).toEqual(true);      
      expect(key.isTwoPart == true).toEqual(true); 
      expect(key.firstPart).toEqual(trialInput);   
      expect(key.secondPart).toEqual(trialInput); 
      expect(key.asString).toEqual(trialInput + "/" + trialInput);       
   });    
   
});