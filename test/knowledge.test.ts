'use strict';
// Copyright Braid Technologies ltd, 2024
import { KnowledgeSource, KnowledgeSourceBuilder, KnowledgeEnrichedMessage, 
   kDefaultMinimumCosineSimilarity, kDefaultKnowledgeSourceCount} from '../core/Knowledge';

import { expect } from 'expect';
import { describe, it } from 'mocha';
import { throwIfUndefined } from '../core/Asserts';

var myUrl: string = "1234";
var mySummary: string = "Jon";
var myAda = new Array<number> ();
var myTimeStamp = new Date();
var myRelevance = 0.5;

var someoneElsesUrl: string = "5678";
var someoneElsesSummary: string = "Barry";
var someoneElseAda = new Array<number> ();
var someoneElsesTimeStamp = new Date(0);
var someoneElsesRelevance = 0.0;

describe("KnowledgeSource", function () {

   var ks1: KnowledgeSource, ks2: KnowledgeSource, ksErr:KnowledgeSource;

   ks1 = new KnowledgeSource(myUrl, mySummary, myAda, myTimeStamp, myRelevance);

   ks2 = new KnowledgeSource(someoneElsesUrl, someoneElsesSummary, someoneElseAda, someoneElsesTimeStamp, someoneElsesRelevance);

   it("Needs to construct an empty object", function () {

      var ksEmpty = new KnowledgeSource();

      expect(ksEmpty.summary).toEqual("");     
   });

   it("Needs to compare for equality and inequality", function () {

      var ksNew: KnowledgeSource = new KnowledgeSource(ks1.url, ks1.summary, ks1.ada_v2, ks1.timeStamp, ks1.relevance);

      expect(ks1.equals(ks1)).toEqual(true);
      expect(ks1.equals(ksNew)).toEqual(true);
      expect(ks1.equals(ks2)).toEqual(false);
   });
   
   
   it("Needs to detect inequality on date", function () {

      var ksNew: KnowledgeSource = new KnowledgeSource(ks1.url, ks1.summary, ks1.ada_v2, new Date(), ks1.relevance);

      expect(ks1.equals(ksNew)).toEqual(false);
   });

   it("Needs to correctly store attributes", function () {
         
      expect(ks1.summary === mySummary).toEqual(true);
      throwIfUndefined (ks1.timeStamp);
      expect(ks1.timeStamp.getTime() === myTimeStamp.getTime()).toEqual(true);
   });

   it("Needs to copy construct", function () {

      let ks2: KnowledgeSource = new KnowledgeSource(ks1);

      expect(ks1.equals(ks2) === true).toEqual(true);
   });

   it("Needs to correctly change attributes", function () {

      var ksNew: KnowledgeSource = new KnowledgeSource(ks1.url, ks1.summary, ks1.ada_v2, ks1.timeStamp, ks1.relevance);

      ksNew.url = someoneElsesUrl;
      ksNew.summary = someoneElsesSummary;
      ksNew.ada_v2 = someoneElseAda;
      ksNew.timeStamp = someoneElsesTimeStamp;
      ksNew.relevance = someoneElsesRelevance;
     
      expect(ks2.equals (ksNew)).toEqual(true);
   });

   it("Needs to convert to and from JSON()", function () {

      var stream: string = ks1.streamOut();

      var ksNew: KnowledgeSource = new KnowledgeSource(ks1.url, ks1.summary, ks1.ada_v2, ks1.timeStamp, ks1.relevance);
      ksNew.streamIn(stream);
    
      expect(ks1.equals(ksNew)).toEqual(true);
   });

});

describe("KnowledgeSourceBuilder", function () {

   it("Needs to construct an empty object", function () {

      let ksEmpty = new KnowledgeSourceBuilder(kDefaultMinimumCosineSimilarity, kDefaultKnowledgeSourceCount);

      expect(ksEmpty.sources.length).toEqual(0);     
   });

   it("Needs to compare for equality and inequality", function () {

      let ksEmpty = new KnowledgeSourceBuilder(kDefaultMinimumCosineSimilarity, kDefaultKnowledgeSourceCount);      
      let matchesNew = new KnowledgeSourceBuilder(-1, 3);        

      expect(ksEmpty.equals(ksEmpty)).toEqual(true);     
      expect(ksEmpty.equals(matchesNew)).toEqual(false);
   });

   it("Needs to correctly store attributes", function () {
         
      let ksEmpty = new KnowledgeSourceBuilder(kDefaultMinimumCosineSimilarity, kDefaultKnowledgeSourceCount);          
      expect(ksEmpty.similarityThreshold === kDefaultMinimumCosineSimilarity).toEqual(true);
      expect(ksEmpty.howMany === kDefaultKnowledgeSourceCount).toEqual(true);
   });
});

describe("KnowledgeEnrichedMessage", function () {

   let ks1 = new KnowledgeSource(myUrl, mySummary, myAda, myTimeStamp, myRelevance);
   let sources1 = new Array<KnowledgeSource> ();
   sources1.push (ks1);
   let enriched1 = new KnowledgeEnrichedMessage (mySummary, sources1);

   let ks2 = new KnowledgeSource(someoneElsesUrl, someoneElsesSummary, someoneElseAda, someoneElsesTimeStamp, someoneElsesRelevance);
   let sources2 = new Array<KnowledgeSource> ();
   sources2.push (ks2);  
   let enriched2 = new KnowledgeEnrichedMessage (someoneElsesSummary, sources2);    

   it("Needs to construct an empty object", function () {

      var enrichedMsgEmpty = new KnowledgeEnrichedMessage();

      expect(enrichedMsgEmpty.sources.length).toEqual(0);     
   });

   it("Needs to compare for equality and inequality", function () {

      let enrichedNew = new KnowledgeEnrichedMessage(mySummary, sources1);        

      expect(enriched1.equals(enriched1)).toEqual(true);     
      expect(enriched1.equals(enrichedNew)).toEqual(true);
      expect(enriched1.equals(enriched2)).toEqual(false);
   });
      

   it("Needs to correctly store attributes", function () {
         
      expect(enriched1.sources[0].summary === mySummary).toEqual(true);
      throwIfUndefined (enriched1.sources[0].timeStamp);
      expect(enriched1.sources[0].timeStamp.getTime() === myTimeStamp.getTime()).toEqual(true);
   });

   it("Needs to copy construct", function () {

      let enriched2: KnowledgeEnrichedMessage = new KnowledgeEnrichedMessage(enriched1);

      expect(enriched1.equals(enriched2) === true).toEqual(true);
   });

   it("Needs to correctly change attributes", function () {

      var enrichedNew: KnowledgeEnrichedMessage = new KnowledgeEnrichedMessage(enriched1);

      expect(enriched1.equals (enrichedNew)).toEqual(true);      

      enrichedNew.sources = sources2;
     
      expect(enriched1.equals (enrichedNew)).toEqual(false);
   });

   it("Needs to convert to and from JSON()", function () {

      var stream: string = enriched1.streamOut();

      var enrichedNew: KnowledgeEnrichedMessage = new KnowledgeEnrichedMessage();
      enrichedNew.streamIn(stream);
    
      expect(enriched1.equals(enrichedNew)).toEqual(true);
   });
});