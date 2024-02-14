/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, useState } from 'react';

// Fluent
import {
   makeStyles, shorthands, 
   Button, ButtonProps, 
   Toolbar, ToolbarButton, ToolbarButtonProps,
   Tooltip, TooltipProps,
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
import { Persona } from '../core/Persona';
import { Message } from '../core/Message';
import { EUIStrings } from './UIStrings';
import { innerColumnFooterStyles, innerColumnStyles, textFieldStyles } from './ColumnStyles';

export interface IConversationHeaderProps {

   joinKey: JoinKey;
   audience: Map<string, Persona>;
}

export interface IConversationRowProps {

   isConnected: boolean;
   joinKey: JoinKey;
   audience: Map<string, Persona>;
   conversation: Array<Message>;
   onSend (message_: string) : void;   
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

const copyButtonStyles = makeStyles({
   root: {    
      marginLeft: '20px' 
   },
});

const CopyButton: React.FC<ToolbarButtonProps> = (props) => {
   
   return (
     <ToolbarButton
       {...props}          
       icon={<Copy24Regular />}
     />
   );
 };

export const ConversationHeaderRow = (props: IConversationHeaderProps) => {

   const headerRowClasses = headerRowStyles();
   const copyButtonClasses = copyButtonStyles();

   // Copy audience to an array for consumption by Fluent classes
   let audienceArray = Array.from(props.audience.values());

   const { inlineItems, overflowItems } = partitionAvatarGroupItems({
      items: audienceArray
    });


    function onCopy (ev: React.MouseEvent<HTMLButtonElement>) : void {

      navigator.clipboard.writeText (props.joinKey.asString);
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
         &nbsp;  
         <Toolbar aria-label="Default" >      
            <Tooltip content={EUIStrings.kCopyJoinKeyButtonPrompt} 
               relationship="label" positioning={'after'}>
               <CopyButton 
                  className={copyButtonClasses.root}
                  aria-label={EUIStrings.kCopyJoinKeyButtonPrompt} 
                  disabled={!(props.joinKey.isValid)} 
                  onClick={onCopy}
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

   if (! props.isConnected) {
      return (<div></div>);
   }
   else {
      return (
         <div className={embeddedRowClasses.root}>      
            <div className={embeddedColumnClasses.root}>                     

               <ConversationHeaderRow joinKey={props.joinKey} audience={props.audience}></ConversationHeaderRow>

               <div className={conversationContentRowClasses.root}>                
                  <div className={conversationContentColumnClasses.root}>             
                     {conversation.map (message => {
                        return (         
                           <MessageView message={message} author={(audience.get (message.authorId) as Persona)}></MessageView>
                     )})}
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

export interface IMessageViewProps {

   message: Message;  
   author: Persona;
}

const messageViewStyles = makeStyles({
   card: {
     ...shorthands.margin("0px"),
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

   function onMessageSend (ev: React.MouseEvent<HTMLButtonElement>) : void {

      props.onSend (message);
      setMessage ("");   
      setCanSend (false);        
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
               maxLength={75}
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
      </div>        
   );
}