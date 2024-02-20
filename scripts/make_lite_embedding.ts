'use strict';
// Copyright Braid technologies ltd, 2024

import { expect } from 'expect';
import { describe, it } from 'mocha';
import fs from 'node:fs/promises';

import embeddingsFile from '../data/transcripts/output/embedding_index_full_3m.json';
import { FullYouTubeEmbedding, LiteYouTubeEmbedding } from '../core/EmbeddingFormats';


describe("Embedding", function () {
 
   it("Needs to build lite embeddings file", async function () {
      
      let embeddings = new Array<FullYouTubeEmbedding>();
      embeddings = embeddingsFile as Array<FullYouTubeEmbedding>;

      let embeddingsLite = new Array<LiteYouTubeEmbedding> ();

      for (let i = 0; i < embeddings.length; i++) {

         embeddingsLite.push ({videoId: embeddings[i].videoId, start: embeddings[i].start, seconds: embeddings[i].seconds, 
                               summary: embeddings[i].summary, ada_v2: embeddings[i].ada_v2})
      }

      var jsonContent = JSON.stringify(embeddingsLite);
       
      let caught = false;

      try {
         let result = await fs.writeFile('core/youtube_embeddings_lite.json', jsonContent, 'utf8');
      }
      catch (e: any) {
         caught = true;
         console.log (e);
      }

      expect (caught).toBe (false);
   });
});

