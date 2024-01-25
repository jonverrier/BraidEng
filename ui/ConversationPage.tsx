/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, useState } from 'react';

// Fluent
import {
   makeStyles, shorthands, useId, 
   Button, ButtonProps, 
   Tooltip,
   Body1,
   Caption1,
   Label,
   Text, 
   Input, 
   InputOnChangeData,
   Card,
   CardFooter,
   CardHeader,
   CardPreview  
} from '@fluentui/react-components';

import {
   Person24Regular,
   Mail24Regular,
   Send24Regular
} from '@fluentui/react-icons';

import { EUIStrings } from './UIStrings';
import { EConfigStrings } from './ConfigStrings';
import { EIcon } from '../core/Icons';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';
import { Persona } from '../core//Persona';
import { Message } from '../core/Message';

export interface IConversationPageProps {

   conversationKey: string;  
}

const viewOuterStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column', 
      width: "100%"      
   },
});

const formStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      width: '100%'
   },
});

export const ConversationPage = (props: IConversationPageProps) => {

   const viewOuterClasses = viewOuterStyles();
   const formClasses = formStyles();  

   let keyGenerator = new UuidKeyGenerator();
   let person = new Persona (keyGenerator.generateKey(), "Jon", EIcon.kPersonPersona, undefined, new Date());
   let bot = new Persona (keyGenerator.generateKey(), "FSChatBot", EIcon.kBotPersona, undefined, new Date());  
   
   let personMessage = new Message (keyGenerator.generateKey(), person.id, undefined, "Hello, from a person.", new Date());
   let botMessage = new Message (keyGenerator.generateKey(), bot.id, undefined, "Hello, from a bot.", new Date());

   let messages = new Array<Message>();
   messages.push (personMessage);
   messages.push (botMessage);   

   if (props.conversationKey.length === 0) {
      return (<div></div>);
   }
   else {
      return (
         <div className={viewOuterClasses.root} >  
            <div className={formClasses.root}>            
               &nbsp;           
               <MessageView message={messages[0]} author={person}></MessageView>
               &nbsp;           
               <MessageView message={messages[1]} author={bot}></MessageView>  
               &nbsp;    
               <InputView></InputView>            
            </div>
         </div>
      );
   }
}

export interface IMessageViewProps {

   message: Message;  
   author: Persona;
}

const messageViewStyles = makeStyles({
   card: {
     ...shorthands.margin("5px"),
     width: "100%"
   },
 });

export const MessageView = (props: IMessageViewProps) => {

   const messageViewClasses = messageViewStyles();
 
   return (
     <Card className={messageViewClasses.card}>
       <CardHeader
         image={
            <Person24Regular/>
         }
         header={
           <Body1>
             <b>{props.author.name}</b> 
           </Body1>
         }
         description={<Caption1>{props.message.text}</Caption1>}
       />

     </Card>
   );
}


export interface IInputViewProps {

}

const SendButton: React.FC<ButtonProps> = (props) => {
   return (
     <Button
       {...props}
       appearance="transparent"
       icon={<Send24Regular />}
       size="medium"
     />
   );
 };

 const messageInputGroupStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      textAlign: 'left',
      width: '100%'
   },
});

 const messageInputStyles = makeStyles({
   root: {    
      width: '100%'
   },
});

export const InputView = (props: IInputViewProps) => {

   const messageInputGroupClasses = messageInputGroupStyles();
   const messageInputClasses = messageInputStyles();

   return (
      <div className={messageInputGroupClasses.root}>
         <Text>{EUIStrings.kSendMessagePreamble}</Text>
         &nbsp;
         <Tooltip withArrow content={EUIStrings.kSendButtonPrompt} relationship="label">
            <Input aria-label={EUIStrings.kSendButtonPrompt}
               className={messageInputClasses.root}                  
               required={true}                  
               /*value={key}*/
               maxLength={40}
               contentBefore={<Mail24Regular />}
               placeholder={EUIStrings.kSendMessagePlaceholder}
               /*onChange={onKeyChange}*/
               disabled={false}
               contentAfter={<SendButton aria-label={EUIStrings.kSendButtonPrompt} />}            
         />
         </Tooltip>   
      </div>        
   );
}