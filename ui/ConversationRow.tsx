/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, KeyboardEvent, useState, useRef, useEffect } from 'react';

// Fluent
import {
   makeStyles, shorthands, 
   Button, ButtonProps, 
   Toolbar, ToolbarButton, ToolbarDivider,
   Tooltip, 
   Body1,
   Caption1,
   Text, 
   Input, 
   InputOnChangeData,
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
   Copy24Regular,
   Delete24Regular
} from '@fluentui/react-icons';

import { EIcon } from '../core/Icons';
import { EConfigStrings }  from '../core/ConfigStrings';
import { JoinKey } from '../core/JoinKey';
import { Persona } from '../core/Persona';
import { Message } from '../core/Message';
import { EUIStrings } from './UIStrings';
import { innerColumnFooterStyles, innerColumnStyles, textFieldStyles } from './ColumnStyles';

export interface IConversationHeaderProps {

   joinKey: JoinKey;
   audience: Map<string, Persona>;
   onDelete () : void;   
}

export interface IConversationRowProps {

   isConnected: boolean;
   joinKey: JoinKey;
   audience: Map<string, Persona>;
   conversation: Array<Message>;
   onSend (message_: string) : void;   
   onDelete () : void;
   isBusy: boolean;
}

const headerRowStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%' 
   },
});


export const ConversationHeaderRow = (props: IConversationHeaderProps) => {

   const headerRowClasses = headerRowStyles();

   // Copy audience to an array for consumption by Fluent classes
   let audienceArray = Array.from(props.audience.values());

   const { inlineItems, overflowItems } = partitionAvatarGroupItems({
      items: audienceArray
    });


   function onCopy (ev: React.MouseEvent<HTMLButtonElement>) : void {

      navigator.clipboard.writeText (props.joinKey.asString);
   }    

   function onDelete (ev: React.MouseEvent<HTMLButtonElement>) : void {

      props.onDelete();
   }     

   return (
      <div className={headerRowClasses.root}>
         <AvatarGroup>
            {inlineItems.map((persona) => (
               <Tooltip content={persona.name} relationship="label" positioning={'below'}>
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
         <ToolbarDivider />
         <Toolbar aria-label="Conversation control toolbar" >      
            <Tooltip content={EUIStrings.kCopyJoinKeyButtonPrompt} 
               relationship="label" positioning={'below'}>
               <ToolbarButton
                  icon={<Copy24Regular />}
                  aria-label={EUIStrings.kCopyJoinKeyButtonPrompt} 
                  disabled={!(props.joinKey.isValid)} 
                  onClick={onCopy}
               />                 
            </Tooltip>        
            <Tooltip content={EUIStrings.kDeleteConversationButtonPrompt} 
               relationship="label" positioning={'below'}>
               <ToolbarButton
                  icon={<Delete24Regular />}
                  aria-label={EUIStrings.kDeleteConversationButtonPrompt} 
                  disabled={!(props.joinKey.isValid)} 
                  onClick={onDelete}
               />  
            </Tooltip>                      
         </Toolbar>           
      </div>
   );
}

const embeddedRowStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100%',
      alignItems: 'stretch',   /* for a row, the main axis is vertical, stretch means fill the row with content */
      justifyContent: 'center' /* for a row, the cross-axis is horizontal, center means vertically centered */           
   },
});

const embeddedColumnStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'    // start layout at the top                  
   },
});

const conversationContentRowStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',         
      width: '100%',           
      alignItems: 'stretch',   /* for a row, the main axis is vertical, stretch means fill the row with content */
      overflowY: 'auto'
   },
});

const conversationContentColumnStyles = makeStyles({
   root: {  
      display: 'flex',
      flexDirection: 'column',                        
      width: '100%',
      overflowY: 'auto'     
   },
});

const DefaultSpinner = (props: Partial<SpinnerProps>) => <Spinner {...props} />;

export const ConversationRow = (props: IConversationRowProps) => {

   const embeddedRowClasses = embeddedRowStyles();
   const embeddedColumnClasses = embeddedColumnStyles();   
   const conversationContentRowClasses = conversationContentRowStyles();
   const conversationContentColumnClasses =  conversationContentColumnStyles();
   const footerSectionClasses = innerColumnFooterStyles();   

   // Shorthand only
   let conversation = props.conversation;
   let audience = props.audience;

   function onSend (messageText_: string) : void {

      props.onSend (messageText_);
   }

   // https://stackoverflow.com/questions/45719909/scroll-to-bottom-of-an-overflowing-div-in-react
   const AlwaysScrollToBottom = () => {
      const elementRef = useRef();
      useEffect(() => (elementRef.current as any).scrollIntoView());
      return <div ref={elementRef as any} />;
    };   

   if (! props.isConnected) {
      return (<div></div>);
   }
   else {
      return (
         <div className={embeddedRowClasses.root}>      
            <div className={embeddedColumnClasses.root}>                     

               <ConversationHeaderRow joinKey={props.joinKey} audience={props.audience} onDelete={props.onDelete}></ConversationHeaderRow>
               
               &nbsp;

               <div className={conversationContentRowClasses.root}>                
                  <div className={conversationContentColumnClasses.root}>             
                     {conversation.map (message => {
                        return (         
                           <SingleMessageView 
                              message={message} 
                              author={(audience.get (message.authorId) as Persona)}
                              showAiWarning={message.authorId === EConfigStrings.kBotGuid}
                           />
                     )})}
                     <AlwaysScrollToBottom />  
                  </div>               
               </div>

               &nbsp;  

               <div className={footerSectionClasses.root}>               
                  {props.isBusy ? <DefaultSpinner/> : <div/>}              
                  <InputView onSend={onSend} isBusy={props.isBusy}></InputView>          
               </div> 
            </div>
         </div>
     );
   }
}

export interface ISingleMessageViewProps {

   message: Message;  
   author: Persona;
   showAiWarning: boolean;
}

 export interface IAuthorIconProps {
 
   author: Persona;
}

const glow = makeStyles({
   root: {    
      marginBottom: '10px' ,      
      boxShadow: '0px 0px 5px 0px white;'
   },
});

const noGlow = makeStyles({
   root: {    
      marginBottom: '10px'       
   },
});

 export const AuthorIcon = (props: IAuthorIconProps) => {

   const glowClasses = glow();    
   const noGlowClasses = noGlow(); 

   return ((props.author.icon === EIcon.kBotPersona) ?
            <Laptop24Regular className={glowClasses.root} />
            : <Person24Regular className={noGlowClasses.root}/>
   );
}

const singleMessageRow = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'left'
   },
});

const singleMessageIconColumn = makeStyles({
   root: {    
      ...shorthands.margin("10px"),      
      display: 'flex',
      flexDirection: 'column'
   },
});

const singleMessageTextColumn = makeStyles({
   root: {    
      ...shorthands.margin("10px"),       
      display: 'flex',
      flexDirection: 'column'
   },
});

const padAfterMessage = makeStyles({
   root: {    
      marginBottom: '10px'    
   },
});


export const SingleMessageView = (props: ISingleMessageViewProps) => {

   const singleMessageRowClasses = singleMessageRow();
   const singleMessageIconColumnClasses = singleMessageIconColumn();
   const singleMessageTextColumnClasses = singleMessageTextColumn();
   const padAfterMessageClasses = padAfterMessage();  

   return (
      <div className={singleMessageRowClasses.root}>
         <div className={singleMessageIconColumnClasses.root}>
            <AuthorIcon author={props.author}/>            
         </div>   
         <div className={singleMessageTextColumnClasses.root}>
            <Body1><b>{props.author.name}</b></Body1>     
            <Caption1 className={padAfterMessageClasses.root}>{props.message.text}</Caption1>             
            {props.showAiWarning  
               ? <Text size={100}> {EUIStrings.kAiContentWarning} </Text>
               : <div/>
            }
         </div>                
      </div>);    
}

export interface IInputViewProps {
   
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

 const messageInputGroupStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      textAlign: 'left',
      width: '100%'
   },
});

export const InputView = (props: IInputViewProps) => {

   const messageInputGroupClasses = messageInputGroupStyles();
   const messageInputClasses = textFieldStyles();

   const [message, setMessage] = useState<string>("");
   const [canSend, setCanSend] = useState<boolean>(false);

   function onKeyChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setMessage (data.value);
      setCanSend (data.value.length > 0);
   }   

   function doSend () : void {

      props.onSend (message);
      setMessage ("");   
      setCanSend (false);        
   }   

   function onKeyDown(ev: KeyboardEvent<HTMLInputElement>): void {
  
      if (ev.key === 'Enter' && canSend) {
         doSend();
      }
   };

   function onMessageSend (ev: React.MouseEvent<HTMLButtonElement>) : void {

      doSend();       
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
               maxLength={512}
               contentBefore={<Mail24Regular />}
               placeholder={EUIStrings.kSendMessagePlaceholder}
               onChange={onKeyChange}
               onKeyDown={onKeyDown}
               disabled={false}
               autoFocus={true}               
               contentAfter={<SendButton 
                  aria-label={EUIStrings.kSendButtonPrompt} 
                  disabled={(!canSend) || (props.isBusy)} 
                  onClick={onMessageSend}
               />}            
         />
         </Tooltip>       
      </div>        
   );
}