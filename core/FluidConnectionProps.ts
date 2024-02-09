// Copyright (c) 2024 Braid Technologies Ltd

// This is a separate file to simplify branching between local & remote operation

import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import { AzureRemoteConnectionConfig, AzureClientProps, ITokenProvider } from "@fluidframework/azure-client";
import axios from "axios";

import { EEnvironment, Environment } from "./Environment";
import { KeyRetriever } from "./KeyRetriever";
import { EConfigStrings } from "./ConfigStrings";

var documentUuid: string = "b03724b3-4be0-4491-b0fa-43b01ab80d50";

export class ConnectionConfig implements AzureRemoteConnectionConfig {

   tokenProvider: ITokenProvider; 
   endpoint: string;
   type: any;
   tenantId: string;
   documentId: string;

   constructor() {
      this.documentId = documentUuid;

   }

   async makeTokenProvider(joinKey_: string): Promise<ITokenProvider> {

      var user: any = { id: documentUuid, name: "BraidBot Chat" };

      if (Environment.environment() == EEnvironment.kLocal) {

         this.tenantId = EConfigStrings.kAzureTenantId;
         this.endpoint = EConfigStrings.kAzureLocalFluidHost;
         this.type = "local";
         this.tokenProvider = new InsecureTokenProvider('testKey', user);

         return (this.tokenProvider);
      }
      else {

         this.tenantId = EConfigStrings.kAzureTenantId;
         this.endpoint = EConfigStrings.kAzureProductionFluidHost;
         this.type = "remote";

         let retriever = new KeyRetriever ()
         var key = await retriever.requestKey (EConfigStrings.kRequestJoinKeyUrl, 
                                               EConfigStrings.kRequestKeyParameterName, 
                                               joinKey_);

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
