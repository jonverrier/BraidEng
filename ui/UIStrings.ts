// Copyright (c) 2024 Braid Technologies Ltd

export enum EUIStrings {

   kJoinPagePreamble = "To join a conversation with @Braid, you need to enter the key from your contact at Braid, pick a conversation to join, then login with LinkedIn to identify yourself.",
   kJoinConversationKeyPrompt = "Key",
   kJoinConversationKeyPlaceholder = "Key... ",  
   kJoinConversationDoesNotLookLikeKey = "It does not look like the key is valid.",
   kJoinConversationLooksLikeKeyOk = "It looks like the key is valid, you can join the conversation via LinkedIn.",
   kJoinConversationWithLinkedInPrompt = "Join with LinkedIn... ",  
   kJoinConversationPicker = "Select a conversation to join.",

   kCohort1ConversationName = "Cohort 1 - Paris Olympics 2024",
   kCohort1Team1ConversationName = "4x100m swim",
   kCohort1Team2ConversationName = "Triathlon",
   kCohort1Team3ConversationName = "Judo",   
   kCohort1Team4ConversationName = "4x400m run",   
   kTestConversationName = "Test",   

   kPageErrorCaption = "Error",
   
   kJoinApiError = "Sorry, we were not able to connect to the conversation.",
   kAiApiError = "Sorry, we were not able to connect to the AI.",   

   kSendMessagePreamble = "Type a message here. If you want @Braid to reply, put '@Braid' in the message. All messages with the phrase '@Braid' are sent to the language model and AI document store, and no others. All messages can be read by everyone in the chat thread.",
   kSendButtonPrompt = "Send",
   kSendMessagePlaceholder = "Write a message... ",   
   kCopyConversationUrlButtonPrompt = "Copy the URL for this conversation to the clipboard",
   kTrimConversationButtonPrompt = "Delete the conversation history",
   kExitConversationButtonPrompt = "Leave this conversation",   
   kAiHasSuggestedDocuments = "@Braid has a suggestion for you.",
   kAiHasNoSuggestedDocuments = "No suggestions at present. Interacting with @Braid will generate suggestions.", 

   kAiNoGoodSources = "@Braid does not have good backup for this answer. AI can make mistakes. Consider checking important information.",
   kAiContentWarning = "AI can make mistakes. Consider checking important information.",

   kNeedInspirationHereIsAnother = "Need more inspiration? Here is a document from another source on a similar topic to the one you just looked at...",
   kNewUserNeedInspiration = "It looks we have a new joiner. You might like to start here, or type your own AI related query at the bottom of the page.",   
   kLLMNameReminder = "Just checking...  if you want your request to be sent to @Braid, include the phrase '@Braid' in your message. With an '@' sign."
};
