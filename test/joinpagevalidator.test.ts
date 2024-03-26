'use strict';
// Copyright Braid Technologies ltd, 2024
import { expect } from 'expect';
import { describe, it } from 'mocha';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { JoinPath } from '../core/JoinPath';
import { JoinDetails } from '../core/JoinDetails';
import { JoinPageValidator } from '../core/JoinPageValidator';

import axios from "axios";

const badUuid = "9a0583f5xca56-421b-8545-aa23032d6c93"

var keyGenerator: IKeyGenerator = new UuidKeyGenerator();

describe("JoinPageValidator", function () {

   it("Needs to detect invalid name", function () {

      let validator = new JoinPageValidator();
      let key = new JoinPath (keyGenerator.generateKey() + '/' + keyGenerator.generateKey());

      expect(validator.isJoinAttemptReady ("", key)== false).toEqual(true);
   });

   it("Needs to detect invalid key", function () {

      let validator = new JoinPageValidator();
      let key = new JoinPath (badUuid + '/' + keyGenerator.generateKey())

      expect(validator.isJoinAttemptReady ("", key)== false).toEqual(true);
   }); 

   it("Needs to detect valid name and key", function () {

      let validator = new JoinPageValidator();
      let key = new JoinPath (keyGenerator.generateKey() + '/' + keyGenerator.generateKey());

      expect(validator.isJoinAttemptReady ("Jon", key)== true).toEqual(true);
   }); 
   
});

describe("JoinPath", function () {

   it("Needs to classify empty string", function () {

      let key = new JoinPath("");

      expect(key.isValid == false).toEqual(true);
   });

   it("Needs to detect invalid single part string", function () {

      let key = new JoinPath("a");

      expect(key.isValid == false).toEqual(true);
   }); 

   it("Needs to detect invalid double part join path", function () {

      let key = new JoinPath("a/");

      expect(key.isValid == false).toEqual(true);
   }); 

   it("Needs to detect invalid second part join path", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinPath(trialInput + '/');

      expect(key.isValid == true).toEqual(true);
      expect(key.isSinglePart == true).toEqual(true);        
   }); 

   it("Needs to detect valid single part join path", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinPath(trialInput);

      expect(key.isValid == true).toEqual(true);
      expect(key.isSinglePart == true).toEqual(true);      
      expect(key.isTwoPart == false).toEqual(true); 
      expect(key.firstPart).toEqual(trialInput);   
      expect(key.secondPart).toEqual("");                 
   }); 

   it("Needs to detect valid double part join path", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinPath(trialInput + "/" + trialInput);

      expect(key.isValid == true).toEqual(true);
      expect(key.isSinglePart == false).toEqual(true);      
      expect(key.isTwoPart == true).toEqual(true); 
      expect(key.firstPart).toEqual(trialInput);   
      expect(key.secondPart).toEqual(trialInput); 
      expect(key.asString).toEqual(trialInput + "/" + trialInput);       
   });    
   
});

describe("JoinDetails", function () {

   it("Needs to classify empty string", function () {

      let details = new JoinDetails("");

      expect(details.isValid == false).toEqual(true);
   });

   it("Needs to detect invalid single part string", function () {

      let details = new JoinDetails("e");

      expect(details.isValid == false).toEqual(true);
   }); 

   it("Needs to detect invalid double part string", function () {

      let details = new JoinDetails("&email=a@b.com&joinpath=/");

      expect(details.isValid == false).toEqual(true);
   }); 

   it("Needs to detect invalid second part string", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinPath(trialInput + '/');
      let details = new JoinDetails("&email=a@b.com&joinpath=" + key.asString);

      expect(details.isValid == true).toEqual(true);
      expect(details.joinPath.isSinglePart == true).toEqual(true);      
   }); 

   it("Needs to detect valid single part join path", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinPath(trialInput);
      let details = new JoinDetails ("&email=a@b.com&joinpath=" + key.asString);

      //expect(details.isValid == true).toEqual(true);
      expect(details.email).toEqual('a@b.com');   
      expect(details.joinPath.asString).toEqual(key.asString);                 
   }); 

   it("Needs to detect valid double part join path", function () {

      let trialInput = keyGenerator.generateKey();
      let key = new JoinPath(trialInput + "/" + trialInput);
      let details = new JoinDetails ("&email=a@b.com&joinpath=" + key.asString);      

      //expect(details.isValid == true).toEqual(true);
      expect(details.email).toEqual('a@b.com');   
      expect(details.joinPath.asString).toEqual(key.asString);      
   });    
   
});