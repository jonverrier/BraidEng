/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, useState } from 'react';

// Fluent
import {
   makeStyles, shorthands, Button, Tooltip,
   Body1,
   Caption1,
   Text, Input, 
   InputOnChangeData,
   Card,
   CardFooter,
   CardHeader,
   CardPreview  
} from '@fluentui/react-components';

import {
   Person24Regular,
   Key24Regular,
   ArrowReplyRegular
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
      flexDirection: 'row',
      height: '100vh', /* fill the screen with flex layout */ 
      paddingLeft: '5px',
      paddingRight: '5px',
      paddingTop: '5px',
      paddingBottom: '5px',
      textAlign: 'center',
      alignItems: 'top'      
   },
});

export const ConversationPage = (props: IConversationPageProps) => {

   const viewOuterClasses = viewOuterStyles();

   let keyGenerator = new UuidKeyGenerator();
   let person = new Persona (keyGenerator.generateKey(), "Jon", EIcon.kPersonPersona, undefined, new Date());
   let bot = new Persona (keyGenerator.generateKey(), "FSChatBot", EIcon.kBotPersona, undefined, new Date());  
   
   let personMessage = new Message (keyGenerator.generateKey(), person.id, undefined, "Hello, from a person.", new Date());
   let botMessage = new Message (keyGenerator.generateKey(), bot.id, undefined, "Hello, from a bot.", new Date());

   let messages = new Array<Message>();
   messages.push (personMessage);
   messages.push (botMessage);   

   return (
      <div className={viewOuterClasses.root} >     
         <MessageView message={messages[0]} author={person}></MessageView>
         <MessageView message={messages[1]} author={bot}></MessageView>         
      </div>
      );
}

export interface IMessageViewProps {

   message: Message;  
   author: Persona;
}

const messageViewStyles = makeStyles({
   card: {
     ...shorthands.margin("auto"),
     width: "720px",
     maxWidth: "100%",
   },
 });

export const MessageView = (props: IMessageViewProps) => {

   const styles = messageViewStyles();
 
   return (
     <Card className={styles.card}>
       <CardHeader
         image={
            <Person24Regular/>
         }
         header={
           <Body1>
             <b>author.name</b> 
           </Body1>
         }
         description={<Caption1>props.message.text</Caption1>}
       />
 
       <CardPreview
         logo={
            <Person24Regular/>
         }
       >
       </CardPreview>
 
       <CardFooter>
         <Button icon={<ArrowReplyRegular/>}>Reply</Button>
       </CardFooter>
     </Card>
   );
}

