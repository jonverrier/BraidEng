'use strict';
// Copyright Braid technologies ltd, 2024

import { OpenAI } from "openai";

import { expect } from 'expect';
import { describe, it } from 'mocha';

import { KStubEnvironmentVariables } from "../core/ConfigStrings";
import { AiConnector } from "../core/AIConnection";

const apiKey = process.env.OPENAI_API_KEY;

import { LiteYouTubeEmbedding } from "../core/EmbeddingFormats";
import liteYouTubeEmbeddings from '../core/youtube_embeddings_lite.json';
import { cosineSimilarity, kKnowledgeSourceCount, YouTubeRespository } from "../core/Knowledge";


describe("Embedding", function () {

   it("Needs to load first line", function () {
      
      let embeddings = new Array<LiteYouTubeEmbedding> ();
      embeddings = liteYouTubeEmbeddings as Array<any>;

      expect (embeddings[0].summary.length > 0).toBe (true);
   });

   it("Needs to compare first and second lines", function () {
      
      let embeddings = new Array<LiteYouTubeEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteYouTubeEmbedding>;

      const scoreWithSelf  = cosineSimilarity(embeddings[0].ada_v2, embeddings[0].ada_v2);
      const scoreWithOther  = cosineSimilarity(embeddings[0].ada_v2, embeddings[1].ada_v2);

      expect (scoreWithSelf > scoreWithOther).toBe (true);
   });

   it("Needs to find closest match for a row that is present", function () {
      
      let embeddings = new Array<LiteYouTubeEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteYouTubeEmbedding>;

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
      
      let embeddings = new Array<LiteYouTubeEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteYouTubeEmbedding>;

      let query = embeddings[100].summary;

      const client = new AiConnector();
      let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);      

      const embedding = await connection.createEmbedding (query);
      let best = YouTubeRespository.lookUpMostSimilar (embedding);

      expect (best.sources.length === kKnowledgeSourceCount).toBe (true);

      // Cheat is a direct look up from the old embedding code - check it is in the ranking.
      let cheat = YouTubeRespository.lookUpMostSimilar (embeddings[100].ada_v2);

      expect ((best.sources[0].summary === embeddings[100].summary)
                || (best.sources[1].summary === embeddings[100].summary)
                || (best.sources[2].summary === embeddings[100].summary)).toBe (true);            
   }).timeout (2000);


   it("Needs to find closest match for a simple query", async function () {
      
      let embeddings = new Array<LiteYouTubeEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteYouTubeEmbedding>;

      let query = "Trolly chicken dilemma chicks"

      const client = new AiConnector();
      let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);      

      const embedding = await connection.createEmbedding (query);
      let best = YouTubeRespository.lookUpMostSimilar (embedding);

      expect (best.sources.length === kKnowledgeSourceCount).toBe (true);       
   }).timeout (2000);   

   it("Needs to find closest match for an irrelevant query", async function () {
      
      let embeddings = new Array<LiteYouTubeEmbedding>();
      embeddings = liteYouTubeEmbeddings as Array<LiteYouTubeEmbedding>;

      let query = "Human baby animals cute cats dogs"

      const client = new AiConnector();
      let connection = await AiConnector.connect (KStubEnvironmentVariables.JoinKey);      

      const embedding = await connection.createEmbedding (query);
      let best = YouTubeRespository.lookUpMostSimilar (embedding);

      expect (best.sources.length === kKnowledgeSourceCount).toBe (true);        
   }).timeout (2000);     
});

