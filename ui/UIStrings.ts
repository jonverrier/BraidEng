// Copyright (c) 2024 Braid Technologies Ltd

export enum EUIStrings {

   kJoinPagePreamble = "To join a conversation with @Braid, you need to enter the key from your contact at Braid, then login with LinkedIn to identify yourself in the conversation.",
   kJoinConversationKeyPrompt = "Key",
   kJoinConversationKeyPlaceholder = "Key... ",  
   kJoinConversationDoesNotLookLikeKey = "It does not look like the joining key is valid.",
   kJoinConversationLooksLikeKeyOk = "It looks like the joining key is valid, you can join the conversation via LinkedIn.",
   kJoinConversationWithLinkedInPrompt = "Join with LinkedIn... ",  

   kPageErrorCaption = "Error",
   
   kJoinApiError = "Sorry, we were not able to connect to the conversation.",
   kAiApiError = "Sorry, we were not able to connect to the AI.",   

   kSendMessagePreamble = "Type a message here. If you want @Braid to reply, put '@Braid' in the message. All messages with the phrase '@Braid' are sent to the language model and AI document store, and no others. All messages can be read by everyone in the chat thread.",
   kSendButtonPrompt = "Send",
   kSendMessagePlaceholder = "Write a message... ",   
   kCopyJoinKeyButtonPrompt = "Copy the joining URL for this conversation to the clipboard",
   kTrimConversationButtonPrompt = "Delete the conversation history",
   kAiHasSuggestedDocuments = "We have suggestions based on your reading history.",
   kAiHasNoSuggestedDocuments = "If you read documents returned by @Braid, we can propose similar documents from other sources.", 

   kAiNoGoodSources = "We could not find good sources for this answer. AI can make mistakes. Consider checking important information.",
   kAiContentWarning = "AI can make mistakes. Consider checking important information.",

   kNeedInspirationHereIsAnother = "Need more inspiration? Here is a document from another source on a similar topic to the one you just looked at.",
   kLLMNameReminder = "Just checking...  if you want your request to be sent to the language model and AI document store, remember to include the phrase '@Braid'. With an '@' sign."
};
