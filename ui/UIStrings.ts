// Copyright (c) 2024 Braid Technologies Ltd

export enum EUIStrings {

   kJoinPagePreamble = "To join a conversation with @Braid, you need to enter the key from your contact at Braid, then your name or initials to identify yourself in the conversation.",
   kJoinConversationAsPrompt = "Join as (name/initials)",
   kJoinConversationAsPlaceholder = "Join as... ",
   kJoinConversationKeyPrompt = "Key",
   kJoinConversationKeyPlaceholder = "Key... ",  
   kJoinConversationDoesNotLookLikeKeyAndName = "It does not look like both the joining key and your name/initials are valid yet.",
   kJoinConversationLooksLikeKeyAndName = "It looks like the joining key and your name/initials are good now, you can join the conversation now.",

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
   kAtReminder = "It looks like you might have wanted me to answer that. If you want me to look up an answer, remember to ask '@Braid'. With an '@' sign."
};
