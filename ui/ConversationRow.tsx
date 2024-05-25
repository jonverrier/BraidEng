/*! Copyright Braid Technologies 2022 */

// React
import React, { useState, useEffect } from 'react';

// Fluent
import {
   makeStyles, shorthands, 
   Button, 
   Toolbar, ToolbarButton, ToolbarDivider,
   Tooltip, 
   Body1,
   Caption1,
   Link,
   Text, 
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
   Send24Regular,
   Copy24Regular,
   Delete24Regular, 
   DoorArrowLeft24Regular,
   ThumbLikeRegular,
   ThumbDislikeRegular
} from '@fluentui/react-icons';

import { EIcon } from '../core/Icons';
import { EConfigNumbers, EConfigStrings }  from '../core/ConfigStrings';
import { Persona } from '../core/Persona';
import { Message } from '../core/Message';
import { Embedding } from '../core/Embedding';
import { EUIStrings } from './UIStrings';
import { innerColumnFooterStyles, textFieldStyles } from './ColumnStyles';
import { SessionKey, ConversationKey } from '../core/Keys';
import { JoinDetails } from '../core/JoinDetails';
import { AnimatedIconButton, EAnimatedIconButtonTypes } from './AnimatedIconButton';
import { MessagePrompt } from './MessagePrompt';
import { Media } from '../core/Media';

export interface IConversationHeaderProps {

   sessionKey: SessionKey;
   conversationKey: ConversationKey;   
   audience: Map<string, Persona>;
   onTrimConversation () : void;  
   onExitConversation () : void;  
}

export interface IConversationRowProps {

   isConnected: boolean;
   sessionKey: SessionKey;
   conversationKey: ConversationKey;    
   audience: Map<string, Persona>;
   conversation: Array<Message>;
   isBusy: boolean;   
   hasSuggestedContent: boolean;
   suggestedContent: string;
   onSend (message_: string) : void;   
   onTrimConversation () : void;   
   onExitConversation () : void;
   onAddSuggestedContent (): void;
   onClickUrl (url_: string): void;   
   onLikeUrl (url_: string): void;   
   onDislikeUrl (url_: string): void;          
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

      // Make join details with no email address and no name
      let joinDetails = JoinDetails.makeFromParts ("", "", props.sessionKey, props.conversationKey);
      
      // https://stackoverflow.com/questions/10783322/window-location-url-javascript

      let newUrl = window.location.protocol + // => "http:"
      '//' +
      window.location.host +                  // => "example.com:3000"
      window.location.pathname +              // => "/pathname/
      '#' + joinDetails.toString();

      navigator.clipboard.writeText (newUrl);
   }       

   function onTrimConversation (ev: React.MouseEvent<HTMLButtonElement>) : void {

      props.onTrimConversation();
   } 

   function onExitConversation (ev: React.MouseEvent<HTMLButtonElement>) : void {

      props.onExitConversation();
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
            <Tooltip content={EUIStrings.kCopyConversationUrlButtonPrompt} 
               relationship="label" positioning={'below'}>
               <ToolbarButton
                  icon={<Copy24Regular />}
                  aria-label={EUIStrings.kCopyConversationUrlButtonPrompt} 
                  disabled={!(props.sessionKey.looksValidSessionKey() && props.conversationKey.looksValidConversationKey())} 
                  onClick={onCopy}
               />                 
            </Tooltip>           
            <Tooltip content={EUIStrings.kTrimConversationButtonPrompt} 
               relationship="label" positioning={'below'}>
               <ToolbarButton
                  icon={<Delete24Regular />}
                  aria-label={EUIStrings.kTrimConversationButtonPrompt} 
                  disabled={!(props.sessionKey.looksValidSessionKey() && props.conversationKey.looksValidConversationKey())} 
                  onClick={onTrimConversation}
               />  
            </Tooltip>       
            <Tooltip content={EUIStrings.kExitConversationButtonPrompt} 
               relationship="label" positioning={'below'}>
               <ToolbarButton
                  icon={<DoorArrowLeft24Regular />}
                  aria-label={EUIStrings.kExitConversationButtonPrompt} 
                  disabled={!(props.sessionKey.looksValidSessionKey() && props.conversationKey.looksValidConversationKey())} 
                  onClick={onExitConversation}
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
   const alwaysScrollToBottomId = "AlwaysScrollToBottom";
    
   // Shorthand only
   let conversation = props.conversation;
   let audience = props.audience;

   function onSend (messageText_: string) : void {

      props.onSend (messageText_);
      scroll();
   }

   // https://stackoverflow.com/questions/45719909/scroll-to-bottom-of-an-overflowing-div-in-react 
   function scroll (): void {

      const divScroll = document.getElementById(
         alwaysScrollToBottomId
       ) as HTMLDivElement | null;

      if (divScroll) {
         divScroll.scrollIntoView();
      }       
   }
 
   useEffect(() => {
      scroll();
    });     

   if (! props.isConnected) {
      return (<div></div>);
   }
   else {
      return (
         <div className={embeddedRowClasses.root}>      
            <div className={embeddedColumnClasses.root}>                     

               <ConversationHeaderRow 
                  sessionKey={props.sessionKey} 
                  conversationKey={props.conversationKey}
                  audience={props.audience} 
                  onTrimConversation={props.onTrimConversation}      
                  onExitConversation={props.onExitConversation}>                                   
               </ConversationHeaderRow>
               
               &nbsp;

               <div className={conversationContentRowClasses.root}>                
                  <div className={conversationContentColumnClasses.root}>             
                     {conversation.map (message => { 
                        return (         
                           <SingleMessageView 
                              sessionKey={props.sessionKey}
                              message={message} 
                              key={message.id}
                              author={Persona.safeAuthorLookup (audience, message.authorId)}
                              showAiWarning={message.authorId === EConfigStrings.kLLMGuid}
                              onClickUrl={props.onClickUrl}  
                              onLikeUrl={props.onLikeUrl}   
                              onDislikeUrl={props.onDislikeUrl}                                                            
                           />
                        )                     
                     })}                          
                     <div id={alwaysScrollToBottomId}/>  
                  </div>               
               </div>

               &nbsp;  

               <div className={footerSectionClasses.root}>               
                  {props.isBusy ? <DefaultSpinner/> : <div/>}              
                  <InputView 
                     onSend={onSend}
                     onAddSuggestedContent={props.onAddSuggestedContent} 
                     isBusy={props.isBusy}
                     hasSuggestedContent={props.hasSuggestedContent}
                     suggestedContent={props.suggestedContent}>
                     </InputView>          
               </div> 
            </div>
         </div>
     );
   }
}

export interface ISingleMessageViewProps {

   sessionKey: SessionKey;
   message: Message;  
   author: Persona;
   showAiWarning: boolean;
   onClickUrl (url_: string) : void;    
   onLikeUrl (url_: string) : void;  
   onDislikeUrl (url_: string) : void;     
}

 export interface IAuthorIconProps {
 
   author: Persona; 
}

export interface IKnowledgeSegmentProps {

   sessionKey: SessionKey;
   segment: Embedding;  
   key: string;
   onClickUrl (url_: string) : void;    
   onLikeUrl (url_: string) : void;  
   onDislikeUrl (url_: string) : void;      
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
   var className;

   if (props.author.icon === EIcon.kLLMPersona) {
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
      marginRight: '10px',
      justifySelf: 'centre'      
   },
});

const greenStyles = makeStyles({
   root: {    
      color: 'green',
      justifySelf: 'centre'       
   },
});

const amberStyles = makeStyles({
   root: {    
      color: 'orange',
      justifySelf: 'centre'  
   },
});

const chunkHeaderStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
   },
});

const likeDislikeStyles = makeStyles({
   root: {    
      alignSelf: 'centre',
      marginLeft: '5px',
      marginRight: '5px'
   }
});

const buttonStyles = makeStyles({
   root: {
      flexGrow: '0',
      flexShrink: '0'      
   }
});

export const KowledgeSegmentsView = (props: IKnowledgeSegmentProps) => {

   const sourcesClasses = sourcesRow();
   const greenClasses = greenStyles();
   const amberClasses = amberStyles();

   let segment = props.segment;
   let relevanceText = segment.relevance ? (segment.relevance * 100).toPrecision(2) + '%': "";
   
   const onClickLink = (event: React.MouseEvent<HTMLAnchorElement>): void => {
      // NB we call 'prevent default' as we want to control the action i.e. open a  new tab. 
      event.stopPropagation();
      event.preventDefault();

      props.onClickUrl (segment.url);  
      (window as any).open(segment.url, '_blank');
   };

   const onClickLike = (event: React.MouseEvent<HTMLButtonElement>): void => {
      // NB we call 'prevent default' as we want to control the action  
      event.stopPropagation();
      event.preventDefault();

      props.onLikeUrl (segment.url);        
   }   

   const onClickDislike = (event: React.MouseEvent<HTMLButtonElement>): void => {
      // NB we call 'prevent default' as we want to control the action  
      event.stopPropagation();
      event.preventDefault();

      props.onDislikeUrl (segment.url);       
   }   

   let relevanceClasses = segment.relevance ? segment.relevance >= 0.8 ? greenClasses : amberClasses : amberClasses; 
   let linkClasses = linkStyles();
   let chunkHeaderClasses = chunkHeaderStyles();  
   let likeDislikeCLasses = likeDislikeStyles();   
   
   let linkText = segment.url;
   
   let media = new Media();
   let maxLength = EConfigNumbers.kMaximumLinkTextlength;
   if (media.isSmallFormFactor()) 
      maxLength = EConfigNumbers.kMaximumLinkTextlengthMobile;

   if (linkText.length > maxLength + 3) {
      linkText = linkText.slice (0, maxLength) + '...';
   }

   return (<div className={sourcesClasses.root} key={segment.url}>
              <div className={chunkHeaderClasses.root}>
                 <Link className={linkClasses.root} 
                    href={segment.url} onClick={onClickLink} inline>{linkText}                
                  </Link>
                  <Body1 className={relevanceClasses.root}> {relevanceText} </Body1>
                  <Toolbar aria-label="Like/dislike control toolbar" >                        
                  <ToolbarDivider />                  
                  <Tooltip content={EUIStrings.kLikedThis} relationship="label" positioning={'above'}>                     
                     <ToolbarButton
                        className={likeDislikeCLasses.root}
                        icon={<ThumbLikeRegular/>} 
                        onClick={onClickLike}/>   
                  </Tooltip>  
                  <Tooltip content={EUIStrings.kDidNotLikeThis} relationship="label" positioning={'above'}>                                           
                     <ToolbarButton 
                        className={likeDislikeCLasses.root}                     
                        icon={<ThumbDislikeRegular/>} 
                        onClick={onClickDislike}/>  
                  </Tooltip>     
                  </Toolbar>                                              
               </div>
               <Body1 className={chunkHeaderClasses.root}> {segment.summary} </Body1>
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
      
      if (props.message.chunks.length > 0) { 

         aiSources = props.message.chunks.map ((segment : Embedding) => {
            return <KowledgeSegmentsView sessionKey={props.sessionKey} segment={segment} key={segment.url} 
                    onClickUrl={props.onClickUrl}
                    onLikeUrl={props.onLikeUrl}
                    onDislikeUrl={props.onDislikeUrl}/>
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
            <AuthorIcon author={props.author} />            
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

export interface IInputViewProps {
   
   isBusy: boolean;
   hasSuggestedContent: boolean;
   suggestedContent: string;
   onSend (message_: string) : void;
   onAddSuggestedContent(): void;
}

 const inputGroupStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      textAlign: 'left',
      width: '100%'
   },
});

const inputRowStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',      
      textAlign: 'left',
      width: '100%'
   },
});

const textColumnStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      width: '100%'
   },
});

const bottonColumnStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      width: 'fit-content'   
   },
});

const bottonRowStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',      
      justifyContent: 'flex-end'
   },
});

export const InputView = (props: IInputViewProps) => {

   const inputGroupClasses =inputGroupStyles();
   const inputRowClasses = inputRowStyles();
   const textColumnClasses = textColumnStyles();
   const buttonColumnClasses = bottonColumnStyles();   
   const buttonRowClasses = bottonRowStyles();      
   const buttonClasses = buttonStyles();

   const [message, setMessage] = useState<string>("");
   const [canSend, setCanSend] = useState<boolean>(false);

   function onSend (message_: string) : void {

      props.onSend (message);
      setMessage ("");   
      setCanSend (false);        
   }   

   function onChange (message_: string) : void {

      setMessage (message_);   
      setCanSend (message_.length > 0);        
   }  

   function onMessageSend (ev: React.MouseEvent<HTMLButtonElement>) : void {

      onSend(message);       
   }

   return (
      <div className={inputGroupClasses.root}>
         <Text>{EUIStrings.kSendMessagePreamble}</Text>
         &nbsp;
         <div className={inputRowClasses.root}>
            <div className={textColumnClasses.root}>
               <MessagePrompt onSend={onSend} onChange={onChange} message={message} />               
            </div>
            &nbsp;           
            <div className={buttonColumnClasses.root}>
               <div className={buttonRowClasses.root}>
                  <Tooltip content={EUIStrings.kSendButtonPrompt} relationship="label" positioning={'above'}>            
                     <Button 
                        className={buttonClasses.root}
                        disabled={(!canSend) || (props.isBusy)}
                        icon={<Send24Regular/>} 
                        onClick={onMessageSend}/>                  
                  </Tooltip>                              
                  &nbsp;
                  <AnimatedIconButton animate={props.hasSuggestedContent} 
                     icon={EAnimatedIconButtonTypes.kLightBulb} 
                     promptAnimated={props.suggestedContent} 
                     promptUnamimated={EUIStrings.kAiHasNoSuggestedDocuments}
                     onClick={props.onAddSuggestedContent}/>      
                  </div>
            </div>       
         </div>   
      </div>        
   );
}