// Copyright (c) 2024 Braid Technologies Ltd
import axios from "axios";

// Local
import { SessionKey } from "./Keys";
import { logApiError } from "./Logging";
import { EConfigStrings } from "./ConfigStrings";


export async function makeSummaryCall (session: SessionKey, text: string) : Promise<string | undefined> {

   let summary: string | undefined = undefined;
   let apiUrl: string = EConfigStrings.kSummariseUrl;
   
   apiUrl = apiUrl + '?session=' + session.toString();

   try {
      let response = await axios.post(apiUrl, {
        data: {
           text: text
        },
        headers: {
           'Content-Type': 'application/json'
        }
      });

      summary = (response.data as string);

   } catch (e: any) {       

      logApiError ("Error calling Summazize API:", e);           
   }   
   
   return summary;
}