'use strict';
// Copyright Braid technologies ltd, 2024

import { expect } from 'expect';
import { describe, it } from 'mocha';
import fs from 'node:fs/promises';

import youTubeEmbeddingsFile from '../data/transcripts/output/master_enriched.json';
import markdownEmbeddingsFile from '../data/markdown/output/master_enriched.json';
import htmlEmbeddingsFile from '../data/html/output/master_enriched.json';
import { FullEmbedding, LiteEmbedding } from '../core/EmbeddingFormats';


describe("Embedding", function () {
 
   async function makeLite (embeddingsFull : Array<FullEmbedding>, embeddingsLiteFile : string) {

      let embeddingsLite = new Array<LiteEmbedding> ();

      for (let i = 0; i < embeddingsFull.length; i++) {

         embeddingsLite.push ({sourceId: embeddingsFull[i].sourceId, start: embeddingsFull[i].start, seconds: embeddingsFull[i].seconds, 
                               summary: embeddingsFull[i].summary, ada_v2: embeddingsFull[i].ada_v2})
      }

      var jsonContent = JSON.stringify(embeddingsLite);
       
      let caught = false;

      try {
         let result = await fs.writeFile(embeddingsLiteFile, jsonContent, 'utf8');
      }
      catch (e: any) {
         caught = true;
         console.log (e);
      }

      return !caught;
   }

   it("Needs to build lite YouTube embeddings file", async function () {
      
      let embeddings = new Array<FullEmbedding>();
      embeddings = youTubeEmbeddingsFile as Array<FullEmbedding>;

      let result = await makeLite (embeddings, 'core/youtube_embeddings_lite.json');


      expect (result).toBe (true);
   });

   it("Needs to build lite Markdown embeddings file", async function () {
      
      let embeddings = new Array<FullEmbedding>();
      embeddings = markdownEmbeddingsFile as Array<FullEmbedding>;

      let result = await makeLite (embeddings, 'core/markdown_embeddings_lite.json');


      expect (result).toBe (true);
   });   

   it("Needs to build lite Html embeddings file", async function () {
      
      let embeddings = new Array<FullEmbedding>();
      embeddings = htmlEmbeddingsFile as Array<FullEmbedding>;

      let result = await makeLite (embeddings, 'core/html_embeddings_lite.json');


      expect (result).toBe (true);
   });      
});

