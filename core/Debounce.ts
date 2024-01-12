// Copyright (c) 2023 TXPCo Ltd

export function debounce(fn : Function, ms: number) {

   var timer: NodeJS.Timeout | null = null;

   return () => {
      if (timer) {
         clearTimeout(timer);
         timer = null;
      }

      timer = setTimeout(() => {
         timer = null;
         fn.apply(this, arguments)
      }, ms);
   };
}