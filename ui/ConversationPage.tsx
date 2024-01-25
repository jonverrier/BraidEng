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
   Laptop24Regular,
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

// create a forceUpdate hook
// https://stackoverflow.com/questions/46240647/how-to-force-a-functional-react-component-to-render
function useForceUpdate() {
   const [value, setValue] = useState(0); // simple integer state
   return () => setValue(value => value + 1); // update state to force render
}

export const ConversationPage = (props: IConversationPageProps) => {

   const viewOuterClasses = viewOuterStyles();
   const formClasses = formStyles();  

   // call the force update hook 
   const forceUpdate = useForceUpdate();

   let keyGenerator = new UuidKeyGenerator();
   let person = new Persona (keyGenerator.generateKey(), "Jon", EIcon.kPersonPersona, undefined, new Date());
   let bot = new Persona (keyGenerator.generateKey(), "Braid Bot", EIcon.kBotPersona, undefined, new Date());  
   
   let personMessage = new Message (keyGenerator.generateKey(), person.id, undefined, "Hello, from a person.", new Date());
   let botMessage = new Message (keyGenerator.generateKey(), bot.id, undefined, "Hello, from the braid bot.", new Date());
   let replaceMessage = new Message (keyGenerator.generateKey(), person.id, undefined, "Will change.", new Date());

   let messages = new Array<Message>();
   messages.push (personMessage);
   messages.push (botMessage);  
   messages.push (replaceMessage);

   let personas = new Map<string, Persona> ();
   personas.set (person.id, person);
   personas.set (bot.id, bot);

   function onSend (messageText_: string) : void {

      let message = new Message ();
      message.authorId = person.id;
      message.text = messageText_;
      message.sentAt = new Date();
      messages[2] = message;

      forceUpdate ();
   }

   if (props.conversationKey.length === 0) {
      return (<div></div>);
   }
   else {
      return (
         <div className={viewOuterClasses.root} >  
            <div className={formClasses.root}>            
               &nbsp;           
               <MessageView message={messages[0]} author={(personas.get (messages[0].authorId) as Persona)}></MessageView>
               &nbsp;           
               <MessageView message={messages[1]} author={(personas.get (messages[1].authorId) as Persona)}></MessageView>  
               &nbsp;    
               <MessageView message={messages[2]} author={(personas.get (messages[2].authorId) as Persona)}></MessageView>  
               &nbsp;                
               <InputView onSend={onSend}></InputView>            
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

 export interface IAuthorIconProps {
 
   author: Persona;
}

 export const AuthorIcon = (props: IAuthorIconProps) => {

   const messageViewClasses = messageViewStyles();
 
   return ((props.author.icon === EIcon.kBotPersona) ?
            <Laptop24Regular/>
            : <Person24Regular/>
   );
}

export const MessageView = (props: IMessageViewProps) => {

   const messageViewClasses = messageViewStyles();
 
   return (
     <Card className={messageViewClasses.card}>
       <CardHeader
         image={
            <AuthorIcon author={props.author}/>
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
   onSend (message_: string) : void;
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

   const [message, setMessage] = useState<string>("");
   const [canSend, setCanSend] = useState<boolean>(false);

   function onKeyChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setMessage (data.value);
      setCanSend (data.value.length > 0);
   }   

   function onMessageSend (ev: React.MouseEvent<HTMLButtonElement>) : void {

      props.onSend (message);
   }

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
               onChange={onKeyChange}
               disabled={false}
               contentAfter={<SendButton 
                  aria-label={EUIStrings.kSendButtonPrompt} 
                  disabled={!canSend} 
                  onClick={onMessageSend}
               />}            
         />
         </Tooltip>   
      </div>        
   );
}