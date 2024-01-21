'use strict';
// Copyright TXPCo ltd, 2021
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
   
   it("Needs to throw exception on communication error", async function () {

      let validator = new JoinPageValidator();

      let caught = false;

      try {
         var url = 'https://madeuphost.com/api/key';

         let conversation = await validator.requestConversationKey(url, keyGenerator.generateKey());
      }
      catch (err) {
         caught = true;
      }

      expect(caught).toEqual(true);   
         
   }).timeout (5000);;   

   it("Needs to throw error on a mocked communication error", async function () {

      let validator = new JoinPageValidator();

      let caught = false;
      
      let old = axios.get;

        axios.get = (function async (key: string, params: any) {  return Promise.resolve({data: null}) }) as any;

      try {
         var url = 'https://madeuphost.com/api/key';

         let conversation = await validator.requestConversationKey(url, keyGenerator.generateKey());
      }
      catch (err) {
         console.log (err);
         caught = true;
      }

      axios.get = old;

      expect(caught).toEqual(true);      
   }).timeout (5000); 

   it("Needs to return a string on successful communication", async function () {

      let validator = new JoinPageValidator();

      let caught = false;
      
      let old = axios.get;

        axios.get = (function async (key: string, params: any) {  return Promise.resolve({data: 'a string'}) }) as any;

      try {
         var url = 'https://madeuphost.com/api/key';

         let conversation = await validator.requestConversationKey(url, keyGenerator.generateKey());
      }
      catch (err) {
         console.log (err);
         caught = true;
      }

      axios.get = old;

      expect(caught).toEqual(false);      
   }).timeout (5000); 

   it("Needs to return a string on successful communication with real back end", async function () {

      let validator = new JoinPageValidator();

      let caught = false;

      try {
         var url = 'https://ambitious-ground-0a343ae03.4.azurestaticapps.net/api/key';

         let conversation = await validator.requestConversationKey(url, "49b65194-26e1-4041-ab11-4078229f478a");
      }
      catch (err) {
         caught = true;
      }

      expect(caught).toEqual(false);      
   }).timeout (5000); 
});