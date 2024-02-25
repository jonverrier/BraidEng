// Copyright (c) 2024 Braid Technologies Ltd

export interface FullEmbedding {
   speaker: string;
   title: string;
   sourceId: string;
   description: string;
   start: string;
   seconds: number;
   text: string;
   summary: string;
   ada_v2: Array<number>;
};

export interface LiteEmbedding {
   sourceId: string;
   start: string;
   seconds: number;   
   summary: string;
   ada_v2: Array<number>;
};


export function makeYouTubeUrl (sourceId: string, startHms: string, seconds: number) : string {

   let a = startHms.split(':'); // split it at the colons

   let h =  a[0], m = a[1], s = a[2];

   return 'https://www.youtube.com/watch?v=' + sourceId + '&t=' + h + 'h' + m + 'm' + s +'s';
} 

export function makeGithubUrl (sourceId: string) : string {

   return 'https://github.com/' + sourceId;
} 