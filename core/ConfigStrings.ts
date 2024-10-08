// Copyright (c) 2024 Braid Technologies Ltd

export enum EConfigStrings {

   kCoreLogCategory = "Core",
   kApiLogCategory = "API",
   kDbLogCategory = "DB",   

   kFontNameForTextWrapCalculation = "12pt Segoe UI",

   kRequestAiKeyUrl = "https://braidapps.io/api/aikey",    
   kRequestFluidKeyUrl = "https://braidapps.io/api/fluidkey",      
   kRequestLocalAiKeyUrl = "http://localhost:1337/api/aikey",  
   kRequestLocalFluidKeyUrl = "http://localhost:1337/api/fluidkey", 
   kHomeRelativeUrl= "/aibot.html",   

   kCheckSessionUrl = "https://braidapi.azurewebsites.net/api/CheckSession",       
   kSummariseUrl = "https://braidapi.azurewebsites.net/api/Summarize",     
   kCheckSessionLocalUrl = "http://localhost:7071/api/CheckSession",        
   kSummariseLocalUrl = "http://localhost:7071/api/Summarize",        
   
   kAzureTenantId = "b9576484-5c2e-4613-bfdf-039948cdd521",
   kAzureProductionFluidHost = "https://eu.fluidrelay.azure.com",
   kAzureLocalFluidHost = "http://localhost:7070",

   kLLMName = 'Boxer',
   kLLMNameLowerCase = 'boxer',   
   kLLMGuid = "313aafdb-a05c-4dc7-98d0-4db7f28f122f",
   kLLMRequestSignature = '@Boxer',
   kLLMRequestSignatureLowerCase = '@boxer',
   kLLMNearRequestSignature = 'Boxer',
   kLLMNearRequestSignatureLowerCase = 'boxer',   
   kOpenAiPersonaPrompt = "You are an AI assistant helping an application developer understand generative AI. You explain complex concepts in simple language, using Python examples if it helps. You limit replies to 50 words or less. If you don't know the answer, say 'I don't know'. If the question is not related to building AI applications, Python, or Large Language Models (LLMs),, say 'That doesn't seem to be about AI'.",
   kInitialQuestionPrompt = "You are an AI assistant helping an application developer understand generative AI. You will be presented with a question. Answer the question in a few sentences, using language a technical graduate student will understand. Limit your reply to 50 words or less. If you don't know the answer, say 'I don't know'. If the question is not related to building AI applications, Python, or Large Language Models (LLMs), say 'That doesn't seem to be about AI'.\n",
   kEnrichmentPrompt = "You will be provided with a question about building applications that use generative AI technology. Write a 50 word summary of an article that would be a great answer to the question. Enriching the summary with additional topics that the question asker might want to understand. Write the summary in the present tense, as though the article exists. If the question is not related to building AI applications, Python, or Large Language Models (LLMs), say 'That doesn't seem to be about AI'.\n",
   kFollowUpPrompt = "You will be provided with a summary of an article about building applications that use generative AI technology. Write a question of no more than 10 words that a reader might ask as a follow up to reading the article.",
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

   kErrorConnectingToKeyAPI = "Error connecting to the Boxer server.",
   kErrorConnectingToAiAPI = "Error connecting to AI server.",

   kSessionParamName = "session",
   kConversationParamName = "conversation",   
   kEmailParamName = "email",
   kNameParamName = "name",
   kSecretParamName = "secret",

   kCohort1ConversationKey = "ad6a038d-3245-4dbb-87ce-656c7c4e4a48",
   kCohort1Team1ConversationKey = "716588fb-c78e-4ebc-bc4c-1a87e5fb0667",   
   kCohort1Team2ConversationKey = "6892663b-b9a2-43b6-8ca0-d66ca3970daa",
   kCohort1Team3ConversationKey = "9ef30378-90c6-4213-8c59-f6c93ca6aa59",   
   kDemoConversationKey = "9193299f-58c5-4895-abe7-5a2f81c13fdc",

   kEmbeddingFileUrlLocal = 'http://localhost:1337/embeddings_lite.json',
   kEmbeddingFileUrlProduction = 'https://braidapps.io/embeddings_lite.json',

   kAdminUserNames = "Jon Verrier" // Comma seperated list of names, at run time we just check if the user name is included in this list. 
};

export enum EConfigNumbers {
   kInitialHelpfulPromptDelayMsecs = 1000,
   kBoxerChattinessMessageCount = 20,
   kMaximumLinkTextlength = 40,
   kMaximumLinkTextlengthMobile = 30,   
   kHelpfulPromptMinimumGapMins = 10, // At least 10 minutes between AI suggestions
   kMessagePrompt2VBorder = 24,       // How much to allow for top + bottom inset
   kMessagePrompt2HBorder = 24,       // How much to allow for left & right inset
   kMessagePromptLineSpace = 8,       // How much to allow between lines
   kMessagePromptMaxCharacters = 2048,
   kMaxDownloadWaitSeconds = 30,
   kMaxMessagesBack = 20,          // Go up to 20 messages back for context to send to the LLM
   kMaxChatLevel = 4, // 0-4 to set how chatty the AI is
   kMinMessagesforRecap = 5 // 5 mesages and we offer a recap at the start
}

// This is used for local running only, as in browser we cannot access environment variables
// NEVER PUT PRODUCTION SECRETS IN HERE
let KStubEnvironmentVariables = {
   SessionKey : "49b65194-26e1-4041-ab11-4078229f478a",
   ConversationKey : "abcde"
};

export {KStubEnvironmentVariables};
   