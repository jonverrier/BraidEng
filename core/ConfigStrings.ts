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
   kOpenAiPersonaPrompt = "You are an AI assistant helping an application developer understand generative AI. You explain complex concepts in simple language, using Python examples if it helps. You limit replies to 50 words or less. If you don't know the answer, say 'I don't know'. If the question is not related to building AI applications, Python, or Large Language Models (LLMs),, say 'That doesn't seem to be about AI'.",
   kInitialQuestionPrompt = "You are an AI assistant helping an application developer understand generative AI. You will be presented with a question. Answer the question in a few sentences, using language a technical graduate student will understand. Limit your reply to 50 words or less. If you don't know the answer, say 'I don't know'. If the question is not related to building AI applications, Python, or Large Language Models (LLMs), say 'That doesn't seem to be about AI'.\n",
   kEnrichmentPrompt = "You will be provided with a question about building applications that use generative AI technology. Write a 50 word summary of an article that would be a great answer to the question. Consider enriching the question with additional topics that the question asker might want to understand. Write the summary in the present tense, as though the article exists. If the question is not related to building AI applications, Python, or Large Language Models (LLMs), say 'That doesn't seem to be about AI'.\n",
   kFollowUpPrompt = "You will be provided with a summary of an article about building applications that use generative AI technology. Write a question of no more than 10 words that a reader might ask as a follow up to reading the article.",
   kEnrichmentQuestionPrefix = "Question: ",
   kFollowUpPrefix = "Article summary: ",
   kGenerateAQuestionPrompt = "You are an AI assistant helping an application developer understand generative AI. Based on the dialog presented as context, generate a 10 word question that is relevant to the subjects being discussed.\n",
   
   // These are applied serially - watch out for adding terms in early edits that then get replaced again later on
   // Spaces are significant
   kPromptLookFor1 = "an LLM",
   kPromptReplaceWith1 = "a Large Language Model (LLM)",
   kPromptLookFor2 = "LLMs",
   kPromptReplaceWith2 = "Large Language Models (LLMs)",   
   kPromptLookFor3 = " LLM ",
   kPromptReplaceWith3 = " Large Language Model (LLM) ",   
   kPromptLookFor4 = " LLm ",
   kPromptReplaceWith4 = " Large Language Model (LLM) ", 
   kPromptLookFor5 = " lLM ",
   kPromptReplaceWith5 = " Large Language Model (LLM) ",
   kPromptLookFor6 = " LlM ",
   kPromptReplaceWith6 = " Large Language Model (LLM) ",

   // Use these to detect questions where we are not relevant
   kResponseNotRelevantMarker = "That doesn't seem to be about AI",
   kResponseDontKnowMarker = "I don't know",   

   kErrorConnectingToKeyAPI = "Error connecting to Braid server.",
   kErrorConnectingToAiAPI = "Error connecting to AI server.",

   kSessionParamName = "session",
   kConversationParamName = "conversation",   
   kEmailParamName = "email",
   kNameParamName = "name",

   kCohort1ConversationKey = "70bdd682-fc2f-4320-bfb5-e18f3f97dada",
   kCohort1Team1ConversationKey = "c2d8690e-97ec-4468-899d-5a7ff49e38ea",   
   kCohort1Team2ConversationKey = "59ea8732-a571-4e81-b45f-31030f1d910a",
   kCohort1Team3ConversationKey = "75316dc5-c242-43e0-a7b1-0cca6c26b80b",   
   kCohort1Team4ConversationKey = "0ace1a29-7cb5-41e4-badb-95a47eae5bb1",     
   kDemoConversationKey = "4087d953-6050-4025-a334-11bf4d12d0ac",
   kBraidPlatformConversationKey = "2406a512-e520-4737-b1f1-7a2eb59387a2",

   kEmbeddingFileUrlLocal = 'http://localhost:1337/embeddings_lite.json',
   kEmbeddingFileUrlProduction = 'https://braidapps.io/embeddings_lite.json',

   kAdminUserNames = "Jon Verrier" // Comma seperated list of names, at run time we just check if the user name is included in this list. 
};

export enum EConfigNumbers {
   kInitialHelpfulPromptDelayMsecs = 1000,
   kUserMessagesBeforePrompt = 20,
   kMaximumLinkTextlength = 40,
   kMaximumLinkTextlengthMobile = 30,   
   kHelpfulPromptMinimumGapMins = 10, // At least 10 minutes between AI suggestions
   kMessagePrompt2VBorder = 24,       // How much to allow for top + bottom inset
   kMessagePrompt2HBorder = 24,       // How much to allow for left & right inset
   kMessagePromptLineSpace = 8,       // How much to allow between lines
   kMessagePromptMaxCharacters = 2048,
   kMaxDownloadWaitSeconds = 30,
   kMaxMessagesBack = 20          // Go up to 20 messages back for context to send to the LLM
}

// This is used for local running only, as in browser we cannot access environment variables
// NEVER PUT PRODUCTION SECRETS IN HERE
let KStubEnvironmentVariables = {
   SessionKey : "49b65194-26e1-4041-ab11-4078229f478a",
   ConversationKey : "abcde"
};

export {KStubEnvironmentVariables};
   