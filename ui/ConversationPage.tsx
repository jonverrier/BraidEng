/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, useState } from 'react';

// Fluent
import {
   makeStyles, shorthands, 
   Button, ButtonProps, 
   Tooltip,
   Body1,
   Caption1,
   Text, 
   Input, 
   InputOnChangeData,
   Card,
   CardHeader,
   Spinner, 
   SpinnerProps,
   partitionAvatarGroupItems,
   AvatarGroup,
   AvatarGroupPopover,
   AvatarGroupItem
} from '@fluentui/react-components';

import {
   Person24Regular,
   Laptop24Regular,
   Mail24Regular,
   Send24Regular,
   Copy24Regular
} from '@fluentui/react-icons';

import { EIcon } from '../core/Icons';
import { JoinKey } from '../core/JoinKey';
import { Persona } from '../core//Persona';
import { Message } from '../core/Message';
import { EUIStrings } from './UIStrings';
import { innerColumnStyles, innerColumnFooterStyles } from './ColumnStyles';

export interface IConversationPageProps {

   isConnected: boolean;
   joinKey: JoinKey;
   audience: Map<string, Persona>;
   conversation: Array<Message>;
   onSend (message_: string) : void;   
   isBusy: boolean;
}

const viewOuterStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'row', 
      alignItems: 'stretch',  /* for a row, the main axis is vertical, flex-end is items aligned to the bottom of the row */
      justifyContent: 'center' /* for a row, the cross-axis is horizontal, center means vertically centered */
   },
});

const audienceStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row'
   },
});

const messageRowStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      marginTop: 'auto' 
   },
});

const messageAreaStyles = makeStyles({
   root: {  
      display: 'flex',
      flexDirection: 'column',         
      width: '100%'    
   },
});

const DefaultSpinner = (props: Partial<SpinnerProps>) => <Spinner {...props} />;

export const ConversationRow = (props: IConversationPageProps) => {

   const viewOuterClasses = viewOuterStyles();
   const innerColumnClasses = innerColumnStyles();   
   const audienceSectionClasses = audienceStyles(); 
   const messageRowClasses = messageRowStyles();
   const messageSectionClasses =  messageAreaStyles();
   const footerSectionClasses = innerColumnFooterStyles();   

   // Shorthand only
   let conversation = props.conversation;
   let audience = props.audience;

   // Copy audience to an array for consumption by Fluent classes
   let audienceArray = Array.from(audience.values());

   const { inlineItems, overflowItems } = partitionAvatarGroupItems({
      items: audienceArray
    });

   function onSend (messageText_: string) : void {

      props.onSend (messageText_);
   }

   if (! props.isConnected) {
      return (<div></div>);
   }
   else {
      return (
         <div className={viewOuterClasses.root} >  
            <div className={innerColumnClasses.root} >                            

               <div className={messageRowClasses.root}>                
                  <div className={messageSectionClasses.root}>             
                     {conversation.map (message => {
                        return (         
                           <MessageView message={message} author={(audience.get (message.authorId) as Persona)}></MessageView>
                     )})}
                  </div>
               </div>
               &nbsp;  

               <div className={footerSectionClasses.root}>               
                  {props.isBusy ? <DefaultSpinner/> : <div/>}              
                  <InputView joinKey={props.joinKey} onSend={onSend} isBusy={props.isBusy}></InputView>          
               </div> 

               <div className={audienceSectionClasses.root}>
                  <AvatarGroup>
                     {inlineItems.map((persona) => (
                        <Tooltip content={persona.name} relationship="label" positioning={'above'}>
                           <AvatarGroupItem name={persona.name} key={persona.id} />
                        </Tooltip>
                     ))}
                    {overflowItems && (
                    <AvatarGroupPopover indicator="icon">
                       {overflowItems.map((persona) => (
                          <AvatarGroupItem name={persona.name} key={persona.id} />
                        ))}
                    </AvatarGroupPopover>
                    )}
                    </AvatarGroup>
               </div> 

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
 
   return (<div>
     &nbsp; 
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
     </div>
   );
}

export interface IInputViewProps {
   
   joinKey: JoinKey;
   onSend (message_: string) : void;
   isBusy: boolean;
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

 const CopyButton: React.FC<ButtonProps> = (props) => {
   return (
     <Button
       {...props}
       icon={<Copy24Regular />}
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

const joinKeyGroupStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',      
      textAlign: 'left',
      justifyContent: 'center'
   },
});

const joinKeyItemStyles = makeStyles({
   root: {    
      alignSelf: 'center'
   },
});

export const InputView = (props: IInputViewProps) => {

   const messageInputGroupClasses = messageInputGroupStyles();
   const messageInputClasses = messageInputStyles();
   const joinKeyGroupClasses = joinKeyGroupStyles();
   const joinKeyItemClasses = joinKeyItemStyles();

   const [message, setMessage] = useState<string>("");
   const [canSend, setCanSend] = useState<boolean>(false);

   function onKeyChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setMessage (data.value);
      setCanSend (data.value.length > 0);
   }   

   function onMessageSend (ev: React.MouseEvent<HTMLButtonElement>) : void {

      props.onSend (message);
      setMessage ("");   
      setCanSend (false);        
   }

   function onCopy (ev: React.MouseEvent<HTMLButtonElement>) : void {

      navigator.clipboard.writeText (props.joinKey.asString);
   }

   return (
      <div className={messageInputGroupClasses.root}>
         <Text>{EUIStrings.kSendMessagePreamble}</Text>
         &nbsp;
         <Tooltip content={EUIStrings.kSendButtonPrompt} relationship="label" positioning={'above'}>
            <Input aria-label={EUIStrings.kSendButtonPrompt}
               className={messageInputClasses.root}                  
               required={true}                  
               value={message}
               maxLength={256}
               contentBefore={<Mail24Regular />}
               placeholder={EUIStrings.kSendMessagePlaceholder}
               onChange={onKeyChange}
               disabled={false}
               contentAfter={<SendButton 
                  aria-label={EUIStrings.kSendButtonPrompt} 
                  disabled={(!canSend) || (props.isBusy)} 
                  onClick={onMessageSend}
               />}            
         />
         </Tooltip> 
         &nbsp;
         <div className={joinKeyGroupClasses.root}>         
            <Text 
               className={joinKeyItemClasses.root}>
               {EUIStrings.kJoinKeySharingPrompt}
            </Text>  
            &nbsp;
            <Tooltip content={EUIStrings.kCopyJoinKeyButtonPrompt} 
               relationship="label"
               positioning={'before-top'}>
               <CopyButton 
                  className={joinKeyItemClasses.root}
                  aria-label={EUIStrings.kCopyJoinKeyButtonPrompt} 
                  disabled={!(props.joinKey.isValid)} 
                  onClick={onCopy}
               />  
               </Tooltip>
            &nbsp;                
         </div>       
      </div>        
   );
}