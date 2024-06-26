// Copyright (c) 2024 Braid Technologies Ltd
import { EnvironmentError } from './Errors';
import { IKeyGenerator } from './IKeyGenerator';

export class UuidKeyGenerator implements IKeyGenerator {

   generateKey (): string {
      return uuid();
   }

   couldBeAKey(key: string): boolean {
      return looksLikeUuid (key);
   }

}

function generateUUID() { // Public Domain/MIT

    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function uuid(): string {

   var newUuid: string = "";
   
   // Check if Blob is supported in Browser as it is not supported in some Safari versions
   if (typeof Blob !== "undefined") {

      let url = URL.createObjectURL(new Blob());
      URL.revokeObjectURL(url);

      if (typeof window === 'undefined') {
         newUuid = url.split(":")[2];
      }
      else {
         switch (window.location.protocol) {
            case 'file:':
               newUuid = url.split("/")[1];
               break;
            case 'http:':
            case 'https:':
            default:
               newUuid = url.split("/")[3];
               break;
         }
      }
   }
   else {

      newUuid = generateUUID();
   }
   
   if (newUuid.length == 0)
      throw new EnvironmentError("Error creating UUID.");

   return newUuid;
}

export function looksLikeUuid(uuid: string): boolean {

   let split = uuid.split('-');

   if ((uuid.length == 36) && (split.length == 5)) {
      return true;
   }

   return false;
}