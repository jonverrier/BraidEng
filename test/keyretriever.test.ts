'use strict';
// Copyright Braid Technologies ltd, 2024
import { expect } from 'expect';
import { describe, it } from 'mocha';
import axios from "axios";

import { IKeyGenerator } from '../core/IKeyGenerator';
import { getDefaultKeyGenerator } from '../core/IKeyGeneratorFactory';
import { KeyRetriever } from '../core/KeyRetriever';
import { EConfigStrings, KStubEnvironmentVariables } from '../core/ConfigStrings';
import { SessionKey } from '../core/Keys';

const badUuid = "9a0583f5xca56-421b-8545-aa23032d6c93"

let keyGenerator : IKeyGenerator = getDefaultKeyGenerator();

describe("KeyRetriever", function () {
   
   it("Needs to throw exception on communication error", async function () {

      let retriever = new KeyRetriever();

      let caught = false;

      try {
         var url = 'https://madeuphost.com/api/key';

         let conversation = await retriever.requestKey(url, 
            EConfigStrings.kSessionParamName, 
            new SessionKey(keyGenerator.generateKey()));
      }
      catch (err) {
         caught = true;
      }

      expect(caught).toEqual(true);   
         
   }).timeout (5000);;   

   it("Needs to throw error on a mocked communication error", async function () {

      let retriever = new KeyRetriever();

      let caught = false;     
      
      let old = axios.get;

        axios.get = (function async (key: string, params: any) {  return Promise.resolve({data: null}) }) as any;

      try {
         var url = 'https://madeuphost.com/api/key';

         let conversation = await retriever.requestKey(url, 
            EConfigStrings.kSessionParamName, 
            new SessionKey (keyGenerator.generateKey()));
      }
      catch (err) {
         console.log (err);
         caught = true;
      }

      axios.get = old;    

      expect(caught).toEqual(true);      
   }).timeout (5000); 

   it("Needs to return a string on successful communication", async function () {

      let retriever = new KeyRetriever();

      let caught = false;
      
      let old = axios.get;   

        axios.get = (function async (key: string, params: any) {  return Promise.resolve({data: 'a string'}) }) as any;

      try {
         var url = 'https://madeuphost.com/api/key';

         let conversation = await retriever.requestKey(url, 
            EConfigStrings.kSessionParamName, 
            new SessionKey (keyGenerator.generateKey()));
      }
      catch (err) {
         console.log (err);
         caught = true;
      }

      axios.get = old;      

      expect(caught).toEqual(false);      
   }).timeout (5000); 

   it("Needs to return a string on successful communication with real back end", async function () {

      let validator = new KeyRetriever();

      let caught = false;      

      try {
         var url = EConfigStrings.kRequestFluidKeyUrl;

         let conversation = await validator.requestKey(url, 
            EConfigStrings.kSessionParamName, 
            new SessionKey (KStubEnvironmentVariables.SessionKey));
      }
      catch (err) {
         caught = true;
      }     

      expect(caught).toEqual(false);   
         
   }).timeout (5000); 

   it("Needs to keep busy count", async function () {

      let retriever = new KeyRetriever(); 

      expect(retriever.isBusy()).toEqual(false);            
   });    
 
});