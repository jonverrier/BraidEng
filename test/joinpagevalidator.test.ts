'use strict';
// Copyright Braid Technologies ltd, 2021
import { expect } from 'expect';
import { describe, it } from 'mocha';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { JoinPageValidator } from '../core/JoinPageValidator';

import axios from "axios";

const badUuid = "9a0583f5xca56-421b-8545-aa23032d6c93"

var keyGenerator: IKeyGenerator = new UuidKeyGenerator();

describe("JoinPageValidator", function () {

   it("Needs to detect invalid name", function () {

      let validator = new JoinPageValidator();

      expect(validator.isJoinAttemptReady ("", keyGenerator.generateKey())== false).toEqual(true);
   });

   it("Needs to detect invalid key", function () {

      let validator = new JoinPageValidator();

      expect(validator.isJoinAttemptReady ("", badUuid)== false).toEqual(true);
   }); 

   it("Needs to detect valid name and key", function () {

      let validator = new JoinPageValidator();

      expect(validator.isJoinAttemptReady ("Jon", keyGenerator.generateKey())== true).toEqual(true);
   }); 
   
});