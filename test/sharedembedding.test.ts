'use strict';
// Copyright Braid Technologies ltd, 2024
import { MDynamicStreamable } from '../core/StreamingFramework';
import { SharedEmbedding } from '../core/SharedEmbedding';
import { IKeyGenerator } from '../core/IKeyGenerator';
import { getDefaultKeyGenerator } from '../core/IKeyGeneratorFactory';

import { expect } from 'expect';
import { describe, it } from 'mocha';

var keyGenerator: IKeyGenerator = getDefaultKeyGenerator();

var myId: string = "1234";
var myUrl: string = "https://www.sample.com";
var myConversationId = "1234";
var myEmail = "jon@mail.com";

var someoneElsesId: string = "5678";
var someoneElsesUrl: string = "https://www.anothersample.com";
var someoneElsesConversationId = "5678";
var someoneElsesEmail = "barry@mail.com";

describe("SharedEmbedding", function () {

   var sharedEmbedding1: SharedEmbedding, sharedEmbedding2: SharedEmbedding, messageErr:SharedEmbedding;

   sharedEmbedding1 = new SharedEmbedding(myId, myUrl, myConversationId, 0, undefined, undefined);

   sharedEmbedding2 = new SharedEmbedding(someoneElsesId, someoneElsesUrl, someoneElsesConversationId, 0, undefined, undefined);

   it("Needs to construct an empty object", function () {

      var messageEmpty = new SharedEmbedding();

      expect(typeof (messageEmpty.url)).toEqual('undefined');
      expect(keyGenerator.couldBeAKey (messageEmpty.id)).toEqual(true);      
   });

   it("Needs to allow undefined ID", function () {

      var caught: boolean = false;
      try {
         messageErr = new SharedEmbedding(undefined, myUrl, myConversationId, 0, undefined, undefined);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(false);
   });

   it("Needs to detect invalid ID", function () {

      var caught: boolean = false;
      try {
         messageErr = new SharedEmbedding(1 as unknown as string, myUrl, myConversationId, 0, undefined, undefined);
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });


   it("Needs to compare for equality and inequality", function () {

      var messageNew: SharedEmbedding = new SharedEmbedding(sharedEmbedding1.id, sharedEmbedding1.url, 
                                                            sharedEmbedding1.conversationId, sharedEmbedding1.netLikeCount, 
                                                            sharedEmbedding1.likedBy, sharedEmbedding1.dislikedBy);

      expect(sharedEmbedding1.equals(sharedEmbedding1)).toEqual(true);
      expect(sharedEmbedding1.equals(messageNew)).toEqual(true);
      expect(sharedEmbedding1.equals(sharedEmbedding2)).toEqual(false);
   });
   

   it("Needs to throw error if like on undefined url", function () {

      var messageEmpty = new SharedEmbedding();

      var caught: boolean = false;
      try {
         let thumb = messageEmpty.like (myEmail);

      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);
   });

   it("Needs to correctly store attributes", function () {
         
      expect(sharedEmbedding1.url === myUrl).toEqual(true);
      expect(sharedEmbedding1.netLikeCount === 0).toEqual(true);
   });

   it("Needs to copy construct", function () {

      let embedding2: SharedEmbedding = new SharedEmbedding(sharedEmbedding1);

      expect(sharedEmbedding1.equals(embedding2) === true).toEqual(true);
   });

   it("Needs to correctly change attributes", function () {

      var messageNew: SharedEmbedding = new SharedEmbedding(sharedEmbedding1.id, sharedEmbedding1.url, 
                                                            sharedEmbedding1.conversationId, sharedEmbedding1.netLikeCount, 
                                                            sharedEmbedding1.likedBy, sharedEmbedding1.dislikedBy);

      messageNew.id = someoneElsesId;
      messageNew.url = someoneElsesUrl;
      messageNew.conversationId = someoneElsesConversationId;

      expect(sharedEmbedding2.equals (messageNew)).toEqual(true);
   });

   it("Needs to catch errors on change id attributes", function () {

      var caught: boolean = false;
      try {
         sharedEmbedding1.id = 1 as unknown as string;
      } catch (e) {
         caught = true;
      }
      expect(caught).toEqual(true);

   });

   it("Needs to convert to and from JSON()", function () {

      var stream: string = sharedEmbedding1.streamOut();

      var messageNew: SharedEmbedding = new SharedEmbedding(sharedEmbedding1.id, sharedEmbedding1.url, 
                                                            sharedEmbedding1.conversationId, sharedEmbedding1.netLikeCount, 
                                                            sharedEmbedding1.likedBy, sharedEmbedding1.dislikedBy);

      messageNew.streamIn(stream);

      expect(sharedEmbedding1.equals(messageNew)).toEqual(true);
   });  

   it("Needs to dynamically create SharedEmbedding to and from JSON()", function () {

      var stream: string = sharedEmbedding1.flatten();

      var messageNew: SharedEmbedding = new SharedEmbedding();

      expect(sharedEmbedding1.equals(messageNew)).toEqual(false);

      messageNew = MDynamicStreamable.resurrect(stream) as SharedEmbedding;

      expect(sharedEmbedding1.equals(messageNew)).toEqual(true);
   });
    
   it("Needs to process a single like", function () {

      var messageEmpty = new SharedEmbedding();
      messageEmpty.url = sharedEmbedding1.url;

      messageEmpty.like(myEmail);

      expect(messageEmpty.netLikeCount).toEqual(1);     
   });

   it("Needs to process a duplicate like", function () {

      var messageEmpty = new SharedEmbedding();
      messageEmpty.url = sharedEmbedding1.url;

      messageEmpty.like(myEmail);
      messageEmpty.like(myEmail);

      expect(messageEmpty.netLikeCount).toEqual(1);     
   });   

   it("Needs to process a single dislike", function () {

      var messageEmpty = new SharedEmbedding();
      messageEmpty.url = sharedEmbedding1.url;

      messageEmpty.dislike(myEmail);

      expect(messageEmpty.netLikeCount).toEqual(-1);     
   });

   it("Needs to process a duplicate dislike", function () {

      var messageEmpty = new SharedEmbedding();
      messageEmpty.url = sharedEmbedding1.url;

      messageEmpty.dislike(myEmail);
      messageEmpty.dislike(myEmail);
      
      expect(messageEmpty.netLikeCount).toEqual(-1);     
   });    
   
   it("Needs to net like then dislike", function () {

      var messageEmpty = new SharedEmbedding();
      messageEmpty.url = sharedEmbedding1.url;

      messageEmpty.like(myEmail);
      messageEmpty.dislike(myEmail);
      
      expect(messageEmpty.netLikeCount).toEqual(0);     
   });    

   it("Needs to net dislike then like", function () {

      var messageEmpty = new SharedEmbedding();
      messageEmpty.url = sharedEmbedding1.url;

      messageEmpty.dislike(myEmail);
      messageEmpty.like(myEmail);
      
      expect(messageEmpty.netLikeCount).toEqual(0);     
   });     
});

