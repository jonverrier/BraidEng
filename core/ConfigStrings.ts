// Copyright (c) 2024 Braid Technologies Ltd

export enum EConfigStrings {

   kApiLogCategory = "API",

   kRequestJoinKeyUrl = "https://ambitious-ground-0a343ae03.4.azurestaticapps.net/api/joinkey",
   kRequestAiKeyUrl = "https://ambitious-ground-0a343ae03.4.azurestaticapps.net/api/aikey",   
   kRequestLocalJoinKeyUrl = "http://localhost:1337/api/joinkey",
   kRequestLocalAiKeyUrl = "http://localhost:1337/api/aikey",     
   kRequestKeyParameterName = "JoinKey",
   
   kAzureTenantId = "45155576-770f-47cc-92dc-9d3328dbf837",
   kAzureProductionFluidHost = "https://eu.fluidrelay.azure.com",
   kAzureLocalFluidHost = "http://localhost:7070",

   kBotName = 'BraidBot',
   kBotGuid = "313aafdb-a05c-4dc7-98d0-4db7f28f122f",
   kBotRequestSignature = '@BraidBot',
   kOpenAiPersonaPrompt = "You are a customer service agent for a bank, skilled in explaining complex products in simple language. You limit replies to 100 words or less.",

   kErrorConnectingToKeyAPI = "Error connecting to Braid server.",
   kErrorConnectingToAiAPI = "Error connecting to AI server." 
};

// This is used for local running only, as in browser we cannot access environment variables
// NEVER PUT PRODUCTION SECRETS IN HERE
let KStubEnvironmentVariables = {
   JoinKey : "49b65194-26e1-4041-ab11-4078229f478a",
   ConversationKey : "abcde"
};

export {KStubEnvironmentVariables};
   