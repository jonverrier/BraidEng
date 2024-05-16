// Copyright (c) 2024 Braid Technologies Ltd

// Internal import
import { EmbeddingMatchAccumulator } from "./Embedding";
import { Message } from "./Message";

export const kDefaultSearchChunkCount: number = 3;
export const kDefaultMinimumCosineSimilarity = 0.8;

export interface IEmbeddingRepository  {

   /**
    * lookupMostSimilar 
    * look to see of we have similar content 
    */      
   lookupMostSimilar (embedding: Array<number>, url: string | undefined, 
      similarityThresholdLo: number, howMany: number) : Promise<EmbeddingMatchAccumulator>;

   /**
    * lookUpSimilarfromUrl 
    * look to see of we have similar content from other sources
    */   
   lookupSimilarfromUrl (url: string, similarityThresholdLo: number, howMany: number) : Promise<EmbeddingMatchAccumulator>;

   /**
    * lookForSuggestedContent 
    * look to see of we have similar content from other sources
    */   
   lookForSuggestedContent (url_: string | undefined, messageText: string) : Promise<Message | undefined>;
}



