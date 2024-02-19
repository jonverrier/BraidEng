'use strict';
// Copyright Braid technologies ltd, 2024

import { OpenAI } from "openai";

import { expect } from 'expect';
import { describe, it } from 'mocha';

const apiKey = process.env.OPENAI_API_KEY;

import { Embeddings } from "openai/resources";

import embeddingsFile from '../data/transcripts/output/embedding_index_full_3m.json';

/**
 * Calculates the cosine similarity between two vectors.
 * @param vector1 The first vector.
 * @param vector2 The second vector.
 * @returns The cosine similarity score.
 */
function cosineSimilarity(vector1: number[], vector2: number[]): number {
   if (vector1.length !== vector2.length) {
       throw new Error("Vector dimensions must match for cosine similarity calculation.");
   }

   const dotProduct = vector1.reduce((acc, val, index) => acc + val * vector2[index], 0);
   const magnitude1 = Math.sqrt(vector1.reduce((acc, val) => acc + val ** 2, 0));
   const magnitude2 = Math.sqrt(vector2.reduce((acc, val) => acc + val ** 2, 0));

   if (magnitude1 === 0 || magnitude2 === 0) {
       throw new Error("Magnitude of a vector must be non-zero for cosine similarity calculation.");
   }

   return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Main function to execute the document similarity comparison.
 */
/* async function compareEmbeddings() {

   try {
        
      console.log("== Building Search Applications with OpenAI ==");

      const client = new OpenAI();
      const engine = "text-embedding-3-small"; 

      const source = "Car";
      const compareTo = "Vehicle";
      const parrot = "A bird";

      const parrotEmbedding = await client.embeddings.create ({ model: engine, input: parrot });
      const embeddings = await client.embeddings.create ({ model: engine, input: source });
      const embeddingsCompareTo = await client.embeddings.create ({ model: engine, input: compareTo});

      const carArray = embeddings.data[0].embedding;
      const vehicleArray = embeddingsCompareTo.data[0].embedding;
      const parrotArray = parrotEmbedding.data[0].embedding;

      const scoreCarWithVehicle  = cosineSimilarity(carArray, vehicleArray);
      console.log("Comparing - Car vs Vehicle...: ", scoreCarWithVehicle.toFixed(7));

      const scoreCarWithParrot  = cosineSimilarity(carArray, parrotArray);
      console.log("Comparing - Car vs Parrot...: ", scoreCarWithParrot .toFixed(7));

  } catch (error) {
      console.error("The sample encountered an error:", error);
  }
} */

interface Embedding {
   speaker: string;
   title: string;
   videoId: string;
   description: string;
   start: string;
   seconds: number;
   text: string;
   summary: string;
   ada_v2: Array<number>;
};

describe("Embedding", function () {

   it("Needs to load first line", function () {
      
      let embeddings = new Array<Embedding> ();
      embeddings = embeddingsFile as Array<any>;

      console.log (embeddings[0]);
      expect (embeddings[0].summary.length > 0).toBe (true);
   });

   it("Needs to compare first and second lines", function () {
      
      let embeddings = new Array<Embedding>();
      embeddings = embeddingsFile as Array<Embedding>;

      const scoreWithSelf  = cosineSimilarity(embeddings[0].ada_v2, embeddings[0].ada_v2);
      const scoreWithOther  = cosineSimilarity(embeddings[0].ada_v2, embeddings[1].ada_v2);

      expect (scoreWithSelf > scoreWithOther).toBe (true);
   });

   it("Needs to find closest match for a row that is present", function () {
      
      let embeddings = new Array<Embedding>();
      embeddings = embeddingsFile as Array<Embedding>;

      let maxScore = 0.0;
      let bestMatch = -1;

      for (let i = 0; i < embeddings.length; i++) {

         let ithEmbed = embeddings[i];
         let ithScore  = cosineSimilarity(ithEmbed.ada_v2, embeddings[0].ada_v2);  
         if (ithScore > maxScore)   {    
            maxScore = ithScore;
            bestMatch = i;
         }
      }

      expect (bestMatch === 0).toBe (true);
   });

   it("Needs to find closest match for a query", async function () {
      
      let embeddings = new Array<Embedding>();
      embeddings = embeddingsFile as Array<Embedding>;

      let maxScore = -1.0;
      let bestMatch = -1.0;
      let query = "Perceptron & Generalized Linear Model";

      const client = new OpenAI();
      const engine = "text-embedding-3-small"; 

      const queryEmbed = await client.embeddings.create ({ model: engine, input: query });

      for (let i = 0; i < embeddings.length; i++) {

         let ithEmbed = embeddings[i];
         let ithScore  = cosineSimilarity(ithEmbed.ada_v2, queryEmbed.data[0].embedding);  
         if (ithScore > maxScore)   {    
            maxScore = ithScore;
            bestMatch = i;
         }
      }

      expect (bestMatch > 0).toBe (true);
      expect (bestMatch <= embeddings.length).toBe (true);

      console.log (embeddings[bestMatch].description);
      console.log (embeddings[bestMatch].summary);
   });
});

