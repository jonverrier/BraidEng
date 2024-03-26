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

   kSendMessagePreamble = "Type a message here. If you want @Braid to reply, put '@Braid' in the message. All messages with the phrase '@Braid' are read by the bot, and no others. All messages are read by anyone in the chat thread.",
   kSendButtonPrompt = "Send",
   kSendMessagePlaceholder = "Write a message... ",   
   kCopyJoinKeyButtonPrompt = "Copy the joining URL for this conversation to the clipboard",
   kTrimParticipantsButtonPrompt = "Trim the audience to those still activive in the conversation",
   kTrimConversationButtonPrompt = "Delete the conversation history",

   kAiNoGoodSources = "I don't have any good sources for this answer.",
   kAiContentWarning = "AI can make mistakes. Consider checking important information.",

   kNeedInspiration = "Need some inspiration? Your classmates have been looking at this.",
   kLLMNameReminder = "Just checking...  if you want your request to be sent the AI model, remember to include the phrase '@Braid'. With an '@' sign."
};
