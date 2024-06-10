// Copyright (c) 2024 Braid Technologies Ltd

export enum EUIStrings {

   kJoinPagePreamble = "To join a conversation with @Braid, you need to enter the key from your contact at Braid, pick a conversation to join, then login with LinkedIn to identify yourself.",
   kJoinConversationKeyPrompt = "Key",
   kJoinConversationKeyPlaceholder = "Key... ",  
   kJoinConversationDoesNotLookLikeKey = "It does not look like the key is valid.",
   kJoinConversationLooksLikeKeyOk = "It looks like the key is valid, you can try to join the conversation via LinkedIn.",
   kJoinConversationWithLinkedInPrompt = "Join with LinkedIn... ",  
   kJoinConversationPicker = "Select a conversation to join.",

   kCohort1ConversationName = "Cohort 1 - Paris Olympics 2024",
   kCohort1Team1ConversationName = "4x100m swim",
   kCohort1Team2ConversationName = "Triathlon",
   kCohort1Team3ConversationName = "Judo",   
   kCohort1Team4ConversationName = "4x400m run",
   kDemoConversationName = "Demo",
   kTestConversationName = "Test",   

   kPageErrorCaption = "Error",
   
   kJoinApiError = "Sorry, we were not able to connect to the conversation.",
   kAiApiError = "Sorry, we were not able to connect to the AI.",   

   kSendMessagePreamble = "Type a message below. If you want @Braid to reply, put '@Braid' in the message. Treat your messages as public and do not enter confidential information.",
   kNoThanks = "No thanks.",
   kLikedThis = "Click to like.",
   kDidNotLikeThis = "Click if you don't like it any more.",
   kSendMessagePlaceholder = "Write a message... ",  
   kMessageTextPrompt = "Ctrl+Enter to send or Esc to cancel.",
   kCopyConversationUrlButtonPrompt = "Copy the URL for this conversation to the clipboard.",
   kTrimConversationButtonPrompt = "Delete the conversation history.",
   kExitConversationButtonPrompt = "Leave this conversation.",   
   kAiHasNoSuggestedDocuments = "No suggestions at present. Interacting with @Braid will generate suggestions.", 
   kPomptToGetStarted = "Where is a good place to start learning about building applications with LLMs? With some examples in Python?",

   kAiNoGoodSources = "@Braid does not have good backup for this answer. AI can make mistakes. Consider checking important information.",
   kAiContentWarning = "AI can make mistakes. Consider checking important information.",

   kLLMNameReminder = "Just checking...  if you want your request to be sent to @Braid, include the phrase '@Braid' in your message. With an '@' sign."
};
