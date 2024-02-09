// Copyright (c) 2024 Braid Technologies Ltd

export enum EUIStrings {

   kJoinPagePreamble = "To join a conversation with the Braid Bot, you need to enter the key from your contact at Braid, then your name or initials to identify yourself in the conversation.",
   kJoinConversationAsPrompt = "Join as (name/initials)",
   kJoinConversationAsPlaceholder = "Join as... ",
   kJoinConversationKeyPrompt = "Key",
   kJoinConversationKeyPlaceholder = "Key... ",  
   kJoinConversationDoesNotLookLikeKeyAndName = "It does not look like both the joining key and your name/initials are valid yet.",
   kJoinConversationLooksLikeKeyAndName = "It looks like the joining key and your name/initials are good now, you can join the conversation now.",

   kPageErrorCaption = "Error",
   //kJoinApiError = "Sorry, we were not able to connect to the conversation. We have not been able to automatically log the error as we cannot connect to our servers. Please try again, or if the error keeps happening, contact us at Braid."
   kJoinApiError = "Sorry, we were not able to connect to the conversation.",
   kAiApiError = "Sorry, we were not able to connect to the AI.",   

   kSendMessagePreamble = "Type a message here. If you want the Braid Bot to reply, put '@BraidBot' in the message. Only messages with the phrase '@BraidBot' are read by the bot, and it reads all of them to keep the overall context.",
   kSendButtonPrompt = "Send",
   kSendMessagePlaceholder = "Write a message... ",   
   kJoinKeySharingPrompt = "You can share this conversation thread with someone else by copying the joining key and sending it to them.",
   kCopyJoinKeyButtonPrompt = "Copy"   
};
