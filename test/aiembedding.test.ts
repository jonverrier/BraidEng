'use strict';
// Copyright Braid technologies ltd, 2024

import { expect } from 'expect';
import { describe, it } from 'mocha';

import { KStubEnvironmentVariables } from "../core/ConfigStrings";
import { AiConnector } from "../core/AIConnection";

import { LiteEmbedding } from "../core/EmbeddingFormats";
import liteYouTubeEmbeddings from '../core/youtube_embeddings_lite.json';
import { KnowledgeRepository, cosineSimilarity, kDefaultMinimumCosineSimilarity, kDefaultKnowledgeSegmentCount } from "../core/Knowledge";


describe("Embedding", function () {

   it("Needs to load first line", function () {
      
      let embeddings = new Array<LiteEmbedding> ();
      embeddings = liteYouTubeEmbeddings as Array<any>;

      expect (embeddings[0].summary.length > 0).toBe (true);
   });

   it("Needs to compare first and second lines", function () {
      
      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      const scoreWithSelf  = cosineSimilarity(embeddings[0].ada_v2, embeddings[0].ada_v2);
      const scoreWithOther  = cosineSimilarity(embeddings[0].ada_v2, embeddings[1].ada_v2);

      expect (scoreWithSelf > scoreWithOther).toBe (true);
   });

   it("Needs to find closest match for a row that is present", function () {
      
      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      let maxScore = 0.0;
      let bestMatch = -1;

      for (let i = 0; i < embeddings.length; i++) {

         let ithEmbed = embeddings[i];
         let ithScore  = cosineSimilarity(ithEmbed.ada_v2, embeddings[100].ada_v2);  
         if (ithScore > maxScore)   {    
            maxScore = ithScore;
            bestMatch = i;
         }
      }
      expect (bestMatch === 100).toBe (true);
   }).timeout (2000);

   it("Needs to find closest match for a query", async function () {
      
      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      let query = embeddings[100].summary;

      const client = new AiConnector();
      let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);      

      const embedding = await connection.createEmbedding (query);
      let best = KnowledgeRepository.lookUpMostSimilar (embedding, 
         kDefaultMinimumCosineSimilarity, 
         kDefaultKnowledgeSegmentCount);

      expect (best.sources.length === kDefaultKnowledgeSegmentCount).toBe (true);

   }).timeout (2000);


   it("Needs to find closest match for a simple query", async function () {
      
      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      let query = "Trolly chicken dilemma chicks"

      const client = new AiConnector();
      let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);      

      const embedding = await connection.createEmbedding (query);
      let best = KnowledgeRepository.lookUpMostSimilar (embedding, 
         0, // Deliberately set this low so we always match
         kDefaultKnowledgeSegmentCount);

      expect (best.sources.length === kDefaultKnowledgeSegmentCount).toBe (true);    

   }).timeout (2000);   

   it("Needs to find closest match for an irrelevant query", async function () {
      
      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      let query = "Human baby animals cute cats dogs"

      const client = new AiConnector();
      let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);      

      const embedding = await connection.createEmbedding (query);
      let best = KnowledgeRepository.lookUpMostSimilar (embedding, 
         0, // Deliberately set this low so we always match
         kDefaultKnowledgeSegmentCount);

      expect (best.sources.length === kDefaultKnowledgeSegmentCount).toBe (true);   

   }).timeout (2000);     

   it("Needs to find closest match for a Markdown query", async function () {
      
      let embeddings = new Array<LiteEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteEmbedding>;

      let query = "User experience is a very important aspect of building apps. Users need to be able to use your app in an efficient way to perform tasks. Being efficient is one thing but you also need to design apps so that they can be used by everyone, to make them accessible. This chapter will focus on this area so you hopefully end up designing an app that people can and want to use. Introduction User experience is how a user interacts with and uses a specific product or service be it a system, tool"

      const client = new AiConnector();
      let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);      

      const embedding = await connection.createEmbedding (query);
      let best = KnowledgeRepository.lookUpMostSimilar (embedding, 
         0, // Deliberately set this low so we always match
         kDefaultKnowledgeSegmentCount);
         
      expect (best.sources.length === kDefaultKnowledgeSegmentCount).toBe (true);    
          
   }).timeout (2000);      
});

