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
   Link,
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
import { JoinPath } from '../core/JoinPath';
import { Persona } from '../core/Persona';
import { Message } from '../core/Message';
import { AIConnection } from '../core/AIConnection';
import { KnowledgeSegment, KnowledgeRepository } from '../core/Knowledge';
import { EUIStrings } from './UIStrings';
import { innerColumnFooterStyles, textFieldStyles } from './ColumnStyles';
import { throwIfUndefined } from '../core/Asserts';
import { JoinDetails } from '../core/JoinDetails';

export interface IConversationHeaderProps {

   joinKey: JoinPath;
   audience: Map<string, Persona>;
   onTrimConversation () : void;    
}

export interface IConversationRowProps {

   isConnected: boolean;
   joinKey: JoinPath;
   audience: Map<string, Persona>;
   conversation: Array<Message>;
   onSend (message_: string) : void;   
   onTrimConversation () : void;   
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

      // Make a join details with no email address
      let joinDetails = JoinDetails.makeFromTwoParts ("", props.joinKey);
      
      // https://stackoverflow.com/questions/10783322/window-location-url-javascript

      let newUrl = window.location.protocol + // => "http:"
      '//' +
      window.location.host +                  // => "example.com:3000"
      window.location.pathname +              // => "/pathname/
      '#' + joinDetails.asString;

      navigator.clipboard.writeText (newUrl);
   }       

   function onTrimConversation (ev: React.MouseEvent<HTMLButtonElement>) : void {

      props.onTrimConversation();
   }       

   return (
      <div className={headerRowClasses.root}>
         <AvatarGroup>
            {inlineItems.map((persona) => (
               <Tooltip content={persona.name} relationship="label" positioning={'below'} key={persona.id}>
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
            <Tooltip content={EUIStrings.kTrimConversationButtonPrompt} 
               relationship="label" positioning={'below'}>
               <ToolbarButton
                  icon={<Delete24Regular />}
                  aria-label={EUIStrings.kTrimConversationButtonPrompt} 
                  disabled={!(props.joinKey.isValid)} 
                  onClick={onTrimConversation}
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

               <ConversationHeaderRow joinKey={props.joinKey} 
                  audience={props.audience} 
                  onTrimConversation={props.onTrimConversation}>                    
               </ConversationHeaderRow>
               
               &nbsp;

               <div className={conversationContentRowClasses.root}>                
                  <div className={conversationContentColumnClasses.root}>             
                     {conversation.map (message => {
                        if (message.isUnPrompted()
                        &&  AIConnection.isFromLLM (message, audience)
                        &&  message.segments.length > 0) {  // This last test is for backwards compatibility with existing conversations - remove when upgrade is communicated. 
                           return (         
                              <SingleFadeMessageView 
                                 message={message} 
                                 key={message.id}
                                 author={(audience.get (message.authorId) as Persona)}
                                 showAiWarning={message.authorId === EConfigStrings.kLLMGuid}
                              />
                           )                     
                        }
                        else {
                           return (         
                              <SingleMessageView 
                                 message={message} 
                                 key={message.id}
                                 author={(audience.get (message.authorId) as Persona)}
                                 showAiWarning={message.authorId === EConfigStrings.kLLMGuid}
                              />
                           )
                        }
                     })}                          
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
   fade: boolean;   
}

export interface IKnowledgeSegmentProps {

   segment: KnowledgeSegment;  
   key: string;
   fade: boolean;
}

const fadeColour = makeStyles({
   root: {  
      color: "#595959"
   },
});

const glow = makeStyles({
   root: {    
      marginBottom: '10px' ,      
      boxShadow: '0px 0px 5px 0px white;'
   },
});

const fadedGlow = makeStyles({
   root: {    
      marginBottom: '10px' ,      
      boxShadow: '0px 0px 5px 0px white;',
      color: "#595959"      
   },
});

const noGlow = makeStyles({
   root: {    
      marginBottom: '10px'       
   },
});

 export const AuthorIcon = (props: IAuthorIconProps) => {

   const glowClasses = glow();    
   const fadedGlowClasses = fadedGlow();    
   const noGlowClasses = noGlow(); 
   var className;

   if (props.author.icon === EIcon.kLLMPersona) {
      if (props.fade)
         className = fadedGlowClasses.root;
      else
         className = glowClasses.root;
   }
   else {
      className = noGlowClasses.root;      
   }

   return ((props.author.icon === EIcon.kLLMPersona) ?
            <Laptop24Regular className={className} />
            : <Person24Regular className={className}/>
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

const sourcesRow = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'left'
   },
});

const padAfterMessage = makeStyles({
   root: {    
      marginBottom: '10px'    
   },
});

const linkStyles = makeStyles({
   root: {    
      marginRight: '10px'    
   },
});

const fadedLinkStyles = makeStyles({
   root: {    
      color: '#595959',
      marginRight: '10px'    
   },
});

const greenStyles = makeStyles({
   root: {    
      color: 'green'    
   },
});

const amberStyles = makeStyles({
   root: {    
      color: 'orange'    
   },
});

const fadedGreenStyles = makeStyles({
   root: {    
      color: '#006622'    
   },
});

const fadedAmberStyles = makeStyles({
   root: {    
      color: '#663d00'    
   },
});

const segmentStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'left'
   },
});

const fadedSegmentStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'left',
      color: "#595959"        
   },
});

export const KowledgeSegmentsView = (props: IKnowledgeSegmentProps) => {

   const sourcesClasses = sourcesRow();
   const greenClasses = greenStyles();
   const amberClasses = amberStyles();
   const fadedGreenClasses = fadedGreenStyles();
   const fadedAmberClasses = fadedAmberStyles();

   let segment = props.segment;
   let relevanceText = segment.relevance ? (segment.relevance * 100).toPrecision(2) + '%': "";

   var relevanceClasses, linkClasses, segmentClasses;
   
   if (props.fade) {
      relevanceClasses = segment.relevance ? segment.relevance >= 0.8 ? fadedGreenClasses : fadedAmberClasses : fadedAmberClasses;  
      linkClasses = fadedLinkStyles();      
      segmentClasses = fadedSegmentStyles();       
   }
   else {
      relevanceClasses = segment.relevance ? segment.relevance >= 0.8 ? greenClasses : amberClasses : amberClasses; 
      linkClasses = linkStyles();
      segmentClasses = segmentStyles();             
   }

   return (<div className={sourcesClasses.root} key={segment.url}>
              <div className={segmentClasses.root}>
                 <Link target='_blank' className={linkClasses.root} 
                    href={segment.url}>{segment.url}
                  </Link>
                  <Body1 className={relevanceClasses.root}> {relevanceText} </Body1>
               </div>
               <Body1 className={segmentClasses.root}> {segment.summary} </Body1>
            </div>      
         );
}

export const SingleMessageView = (props: ISingleMessageViewProps) => {

   const singleMessageRowClasses = singleMessageRow();
   const singleMessageIconColumnClasses = singleMessageIconColumn();
   const singleMessageTextColumnClasses = singleMessageTextColumn();

   const padAfterMessageClasses = padAfterMessage();  
   const amberClasses = amberStyles();

   var aiSources;
   var aiFooter;   

   if (props.showAiWarning) {
      
      if (props.message.segments.length > 0) { 

         aiSources = props.message.segments.map ((segment : KnowledgeSegment) => {
            return <KowledgeSegmentsView segment={segment} fade={false} key={segment.url}/>
         })   
         aiFooter = <Text size={100}> {EUIStrings.kAiContentWarning} </Text>;   
      }
      else {
         aiSources = <Text size={100} className={amberClasses.root}> {EUIStrings.kAiNoGoodSources} </Text>;  
         aiFooter = <div/>;         
      }
   } 
   else {
      aiFooter = <div/>;
      aiSources = <div/>;
   }

   return (
      <div className={singleMessageRowClasses.root}>
         <div className={singleMessageIconColumnClasses.root}>
            <AuthorIcon author={props.author} fade={false}/>            
         </div>   
         <div className={singleMessageTextColumnClasses.root}>
            <Caption1><b>{props.author.name}</b></Caption1>     
            <Body1>{props.message.text}</Body1>   
            <div className={padAfterMessageClasses.root}></div>              
            {aiSources}  
            <div className={padAfterMessageClasses.root}></div>                     
            {aiFooter}
            <div className={padAfterMessageClasses.root}></div> 
         </div>              
      </div>);    
}

export const SingleFadeMessageView = (props: ISingleMessageViewProps) => {

   const singleMessageRowClasses = singleMessageRow();
   const singleMessageIconColumnClasses = singleMessageIconColumn();
   const singleMessageTextColumnClasses = singleMessageTextColumn();
   const padAfterMessageClasses = padAfterMessage();  
   const fadeColourClasses = fadeColour();

   return (
      <div className={singleMessageRowClasses.root}>
         <div className={singleMessageIconColumnClasses.root}>
            <AuthorIcon author={props.author} fade={true}/>            
         </div>   
         <div className={singleMessageTextColumnClasses.root}>
            <Caption1 className={fadeColourClasses.root}><b>{props.author.name}</b></Caption1>     
            <Body1 className={fadeColourClasses.root}>{props.message.text}</Body1>  
            <KowledgeSegmentsView segment={props.message.segments[0]} fade={true} key={props.message.segments[0].url}/>
            <div className={padAfterMessageClasses.root}></div>              
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
               maxLength={256}
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