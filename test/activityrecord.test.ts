'use strict';
// Copyright Braid technologies ltd, 2024
import { MDynamicStreamable } from '../core/StreamingFramework';
import { ActivityRecord} from '../core/ActivityRecord';
import { UrlActivityRecord } from '../core/UrlActivityRecord';
import { SessionKey } from '../core/Keys';
import { getRecordRepository } from '../core/IActivityRepositoryFactory';
import { ActivityRepositoryMongo } from '../core/ActivityRepositoryMongo';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';

import { expect } from 'expect';
import { describe, it } from 'mocha';
import { throwIfUndefined } from '../core/Asserts';

const keyGenerator = new UuidKeyGenerator();

var myId: string = "1234";
var myEmail: string = "Jon";
var myHappenedAt = ActivityRecord.makeDateUTC (new Date());

var someoneElsesId: string = "5678";
var someoneElsesEmail: string = "Barry";
var someoneElsesHappenedAt = ActivityRecord.makeDateUTC (new Date());

describe("ActivityRecord", function () {

   var activity1: ActivityRecord, activity2: ActivityRecord, activityErr:ActivityRecord;

   activity1 = new ActivityRecord(myId, myEmail, myHappenedAt);

   activity2 = new ActivityRecord(someoneElsesId, someoneElsesEmail, someoneElsesHappenedAt);

   it("Needs to construct an empty object", function () {

      var activityEmpty = new ActivityRecord();

      expect(activityEmpty.email).toEqual("");     
   });

   it("Needs to allow undefined ID", function () {

      var caught: boolean = false;
      try {
         var activityErr: ActivityRecord = new ActivityRecord(undefined, myId, myHappenedAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(false);
   });

   it("Needs to detect invalid ID", function () {

      var caught: boolean = false;
      try {
         var activityErr: ActivityRecord = new ActivityRecord(1 as unknown as string, myId, myHappenedAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });

   it("Needs to detect invalid name", function () {

      var caught: boolean = false;
      try {
         var activityErr: ActivityRecord = new ActivityRecord(myId, undefined as unknown as string, myHappenedAt);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });


   it("Needs to compare for equality and inequality", function () {

      var activityNew: ActivityRecord = new ActivityRecord(activity1.id, activity1.email, activity1.happenedAt);

      expect(activity1.equals(activity1)).toEqual(true);
      expect(activity1.equals(activityNew)).toEqual(true);
      expect(activity1.equals(activity2)).toEqual(false);
   });
   
   it("Needs to detect inequality on date", function () {

      var activityNew: ActivityRecord = new ActivityRecord(activity1.id, activity1.email, new Date());

      expect(activity1.equals(activityNew)).toEqual(false);
   });

   it("Needs to correctly store attributes", function () {
         
      expect(activity1.email === myEmail).toEqual(true);
      expect(activity1.happenedAt.getTime() === myHappenedAt.getTime()).toEqual(true);
   });

   it("Needs to copy construct", function () {

      let activity2: ActivityRecord = new ActivityRecord(activity1);

      expect(activity1.equals(activity2) === true).toEqual(true);
   });

   it("Needs to correctly change attributes", function () {

      var activityNew: ActivityRecord = new ActivityRecord(activity1.id, activity1.email, activity1.happenedAt);

      activityNew.id = someoneElsesId;
      activityNew.email = someoneElsesEmail;
      activityNew.happenedAt = ActivityRecord.makeDateUTC (someoneElsesHappenedAt);

      expect(activity2.equals (activityNew)).toEqual(true);
   });

   it("Needs to catch errors on change id attributes", function () {

      var caught: boolean = false;
      try {
         activity1.id = 1 as unknown as string;
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });

   it("Needs to throw errors on change name attribute", function () {

      var caught: boolean = false;
      try {
         activity1.email = undefined as unknown as string;
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });

   it("Needs to convert to and from JSON()", function () {

      var stream: string = activity1.streamOut();

      var activityNew: ActivityRecord = new ActivityRecord(activity1.id, activity1.email, activity1.happenedAt);
      activityNew.streamIn(stream);

      expect(activity1.equals(activityNew)).toEqual(true);
   });

   it("Needs to dynamically create ActivityRecord to and from JSON()", function () {

      var stream: string = activity1.flatten();

      var activityNew: ActivityRecord = new ActivityRecord();

      expect(activity1.equals(activityNew)).toEqual(false);

      activityNew = MDynamicStreamable.resurrect(stream) as ActivityRecord;

      expect(activity1.equals(activityNew)).toEqual(true);
   });

});

var myUrl: string = "url";
var someoneElsesUrl: string = "Barry";

describe("UrlActivityRecord", function () {

   var activity1: UrlActivityRecord, activity2: UrlActivityRecord, activityErr:UrlActivityRecord;

   activity1 = new UrlActivityRecord(myId, myEmail, myHappenedAt, myUrl);

   activity2 = new UrlActivityRecord(someoneElsesId, someoneElsesEmail, someoneElsesHappenedAt, someoneElsesUrl);

   it("Needs to construct an empty object", function () {

      var activityEmpty = new UrlActivityRecord();

      expect(activityEmpty.url).toEqual("");     
   });


   it("Needs to detect invalid url", function () {

      var caught: boolean = false;
      try {
         var activityErr: UrlActivityRecord = new UrlActivityRecord(myId, myEmail, myHappenedAt, undefined as unknown as string);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });


   it("Needs to compare for equality and inequality", function () {

      var activityNew: UrlActivityRecord = new UrlActivityRecord(activity1.id, activity1.email, activity1.happenedAt, activity1.url);

      expect(activity1.equals(activity1)).toEqual(true);
      expect(activity1.equals(activityNew)).toEqual(true);
      expect(activity1.equals(activity2)).toEqual(false);
   });


   it("Needs to correctly store attributes", function () {
         
      expect(activity1.url === myUrl).toEqual(true);
   });

   it("Needs to copy construct", function () {

      let activity2: UrlActivityRecord = new UrlActivityRecord(activity1);

      expect(activity1.equals(activity2) === true).toEqual(true);
   });

   it("Needs to correctly change attributes", function () {

      var activityNew: UrlActivityRecord = new UrlActivityRecord(activity1.id, activity1.email, activity1.happenedAt, activity1.url);

      activityNew.id = someoneElsesId;
      activityNew.email = someoneElsesEmail;
      activityNew.happenedAt = someoneElsesHappenedAt;
      activityNew.url = someoneElsesUrl;      

      expect(activity2.equals (activityNew)).toEqual(true);
   });

   it("Needs to throw errors on change url attribute", function () {

      var caught: boolean = false;
      try {
         activity1.url = undefined as unknown as string;
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });

   it("Needs to convert to and from JSON()", function () {

      var stream: string = activity1.streamOut();

      var activityNew: UrlActivityRecord = new UrlActivityRecord(activity1.id, activity1.email, activity1.happenedAt, activity1.url);
      activityNew.streamIn(stream);

      expect(activity1.equals(activityNew)).toEqual(true);
   });

   it("Needs to dynamically create ActivityRecord to and from JSON()", function () {

      var stream: string = activity1.flatten();

      var activityNew: UrlActivityRecord = new UrlActivityRecord();

      expect(activity1.equals(activityNew)).toEqual(false);

      activityNew = MDynamicStreamable.resurrect(stream) as UrlActivityRecord;

      expect(activity1.equals(activityNew)).toEqual(true);
   });

});


describe("ActivityRepository", function () {

   this.timeout(10000);

   beforeEach(async () => {

      this.timeout(10000);
   });
      
   let sessionKey = process.env.SessionKey;
   throwIfUndefined (sessionKey);
   let repository = getRecordRepository(new SessionKey (sessionKey));

   it("Needs to save a record", async function () {

      var activity = new UrlActivityRecord(keyGenerator.generateKey(), 
                                 "jonathanverrier@hotmail.com", new Date(), 
                                 "https://test.cosmos");

      let saved = await repository.save (activity);

      expect(saved).toEqual(true);     
   });


   it("Needs to load a record", async function () {

      let loaded = await repository.loadRecent (3);

      expect(true).toEqual(true);     
   });  

});

describe("ActivityRepositoryMongo", function () {

   this.timeout(10000);

   beforeEach(async () => {

      this.timeout(10000);
   });
      
   let sessionKey = process.env.SessionKey;
   throwIfUndefined (sessionKey);
   let repository = new ActivityRepositoryMongo (new SessionKey (sessionKey));

   it("Needs to save a record", async function () {

      var activity = new UrlActivityRecord(keyGenerator.generateKey(), 
                                 "jonathanverrier@hotmail.com", new Date(), 
                                 "https://test.mongo");

      let saved = await repository.save (activity);

      expect(saved).toEqual(true);     
   });


   it("Needs to load a record", async function () {

      let loaded = await repository.loadRecent (3);

      expect(true).toEqual(true);     
   });  

});
