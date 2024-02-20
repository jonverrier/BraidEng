// Copyright (c) 2024 Braid Technologies Ltd

export interface FullYouTubeEmbedding {
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

export interface LiteYouTubeEmbedding {
   videoId: string;
   start: string;
   seconds: number;
   summary: string;
   ada_v2: Array<number>;
};


export function makeYouTubeUrl (videoId: string, startHms: string, seconds: number) : string {

   let a = startHms.split(':'); // split it at the colons

   let h =  a[0], m = a[1], s = a[2];

   return 'https://www.youtube.com/watch?v=' + videoId + '&t=' + h + 'h' + m + 'm' + s +'s';
} 