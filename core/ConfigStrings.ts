// Copyright (c) 2024 Braid Technologies Ltd

export enum EConfigStrings {

   kApiLogCategory = "API",

   kRequestJoinKeyUrl = "https://kind-bush-0a0041d03.4.azurestaticapps.net/api/joinkey",
   kRequestAiKeyUrl = "https://kind-bush-0a0041d03.4.azurestaticapps.net/api/aikey",   
   kRequestLocalJoinKeyUrl = "http://localhost:1337/api/joinkey",
   kRequestLocalAiKeyUrl = "http://localhost:1337/api/aikey",     
   kRequestKeyParameterName = "JoinKey",
   
   kAzureTenantId = "45155576-770f-47cc-92dc-9d3328dbf837",
   kAzureProductionFluidHost = "https://eu.fluidrelay.azure.com",
   kAzureLocalFluidHost = "http://localhost:7070",

   kLLMName = 'Braid',
   kLLMNameLowerCase = 'braid',   
   kLLMGuid = "313aafdb-a05c-4dc7-98d0-4db7f28f122f",
   kLLMRequestSignature = '@Braid',
   kLLMRequestSignatureLowerCase = '@braid',
   kLLMNearRequestSignature = 'Braid',
   kLLMNearRequestSignatureLowerCase = 'braid',   
   kOpenAiPersonaPrompt = "You are an AI assistant helping a developer understand AI. You explaining complex concepts in simple language, using Python examples if it helps. You limit replies to 100 words or less. If you don't know the answer to a question, just say 'I don't know'.",

   kErrorConnectingToKeyAPI = "Error connecting to Braid server.",
   kErrorConnectingToAiAPI = "Error connecting to AI server." 
};

export enum EConfigNumbers {
   kHelpfulPromptDelayMsecs = 5000,
   kHelpfulPromptMinimumGapMins = 60
}

// This is used for local running only, as in browser we cannot access environment variables
// NEVER PUT PRODUCTION SECRETS IN HERE
let KStubEnvironmentVariables = {
   JoinKey : "49b65194-26e1-4041-ab11-4078229f478a",
   ConversationKey : "abcde"
};

export {KStubEnvironmentVariables};
   