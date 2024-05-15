// Copyright (c) 2024 Braid Technologies Ltd

export enum EConfigStrings {

   kCoreLogCategory = "Core",
   kApiLogCategory = "API",
   kDbLogCategory = "DB",   

   kFontNameForTextWrapCalculation = "12pt Segoe UI",

   kRequestSessionKeyUrl = "https://braidapps.io/api/joinkey",
   kRequestAiKeyUrl = "https://braidapps.io/api/aikey",   
   kRequestMongoDbKeyUrl = "https://braidapps.io/api/mdbkey",
   kRequestCosmosDbKeyUrl = "https://braidapps.io/api/cdbkey",   
   kRequestLocalSessionKeyUrl = "http://localhost:1337/api/joinkey",
   kRequestLocalAiKeyUrl = "http://localhost:1337/api/aikey",  
   kRequestLocalMongoDbKeyUrl = "http://localhost:1337/api/mdbkey",    
   kRequestLocalCosmosDbKeyUrl = "http://localhost:1337/api/cdbkey",       
   kLoginRelativeUrl= "/api/login",
   kHomeRelativeUrl= "/aibot.html",   
   
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
   kOpenAiPersonaPrompt = "You are an AI assistant helping a team of developers understand AI. You explaining complex concepts in simple language, using Python examples if it helps. You limit replies to 100 words or less. If you don't know the answer to a question, just say 'I don't know'.",

   kErrorConnectingToKeyAPI = "Error connecting to Braid server.",
   kErrorConnectingToAiAPI = "Error connecting to AI server.",

   kSessionParamName = "session",
   kConversationParamName = "conversation",   
   kEmailParamName = "email",
   kNameParamName = "name",

   kCohort1ConversationKey = "d94c8521-b234-4679-8b8f-93bcc0a221b7",
   kCohort1Team1ConversationKey = "1591d257-f836-4faf-bdb7-703b02539b95",   
   kCohort1Team2ConversationKey = "f0837123-6ed3-4c49-84f9-be6c3dc54855",
   kCohort1Team3ConversationKey = "e586f7f7-4d4b-485c-b50f-382c544fd8e6",   
   kCohort1Team4ConversationKey = "694cef73-939f-4c6c-ab02-76158a41ac43",     
   kDemoConversationKey = "",

   kEmbeddingFileUrlLocal = 'http://localhost:1337/embeddings_lite.json',
   kEmbeddingFileUrlProduction = 'https://braidapps.io/embeddings_lite.json',   
};

export enum EConfigNumbers {
   kHelpfulPromptDelayMsecs = 3000,
   kMaximumLinkTextlength = 40,
   kHelpfulPromptMinimumGapMins = 10,
   kMessagePrompt2VBorder = 24,   // How much to allow for top + bottom inset
   kMessagePrompt2HBorder = 24,   // How much to allow for left & right inset
   kMessagePromptLineSpace = 8,   // How much to allow between lines
   kMessagePromptMaxCharacters = 2048,
   kMaxDownloadWaitSeconds = 20    
}

// This is used for local running only, as in browser we cannot access environment variables
// NEVER PUT PRODUCTION SECRETS IN HERE
let KStubEnvironmentVariables = {
   SessionKey : "49b65194-26e1-4041-ab11-4078229f478a",
   ConversationKey : "abcde"
};

export {KStubEnvironmentVariables};
   