// Copyright (c) 2024 Braid Technologies Ltd

export function debounce(fn_ : Function, ms_: number) {

   var timer: NodeJS.Timeout | null = null;

   return () => {
      if (timer) {
         clearTimeout(timer);
         timer = null;
      }

      timer = setTimeout(() => {
         timer = null;
         fn_.apply(this, arguments)
      }, ms_);
   };
}