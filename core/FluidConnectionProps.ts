// Copyright (c) 2024 Braid Technologies Ltd

// This is a separate file to simplify branching between local & remote operation

import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import { AzureRemoteConnectionConfig, AzureClientProps, ITokenProvider } from "@fluidframework/azure-client";
import axios from "axios";

import { ConnectionError } from './Errors';

var documentUuid: string = "b03724b3-4be0-4491-b0fa-43b01ab80d50";

var develop = true;

export class ConnectionConfig implements AzureRemoteConnectionConfig {

   tokenProvider: ITokenProvider; 
   endpoint: string;
   type: any;
   tenantId: string;
   documentId: string;

   private async getToken(tenantId_: string, documentId_: string, name_: string, id_: string): Promise<string> {

      var connection = (!develop) ? "https://www.ultrabox.me.uk/api/key" : location.protocol + '//' + location.host + '/api/key';

      const response = await axios.get(connection, {
         params: {
            tenantId_,
            documentId_,
            userId: id_,
            userName: name_
         },
      });

      if (!response.data)
         throw new ConnectionError("Error connecting to remote data services for API token.");

      return response.data as string;
   }

   constructor() {
      this.documentId = documentUuid;

   }

   async makeTokenProvider(): Promise<ITokenProvider> {

      var user: any = { id: documentUuid, name: "Whiteboard Application" };

      if (develop) {
         this.tenantId = "06fcf322-99f7-412d-9889-f2e94b066b7e";
         this.endpoint = "http://localhost:7070";
         this.type = "local";
         this.tokenProvider = new InsecureTokenProvider('testKey', user);

         return (this.tokenProvider);
      }
      else {
         this.tenantId = "06fcf322-99f7-412d-9889-f2e94b066b7e";
         this.endpoint = "https://eu.fluidrelay.azure.com";
         this.type = "remote";

         var key = await this.getToken(this.tenantId, this.documentId, user.name, user.id);

         this.tokenProvider = new InsecureTokenProvider(key, user);
         return (this.tokenProvider);
      }
   }
};

export class ClientProps implements AzureClientProps {
   connection: ConnectionConfig;

   constructor() {
      this.connection = new ConnectionConfig();
   }
};
