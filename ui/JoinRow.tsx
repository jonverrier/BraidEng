/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, MouseEvent, useState } from 'react';

// Fluent
import {
   makeStyles, shorthands, 
   Dropdown, Option, Tooltip,
   Text, Input, Image, 
   InputOnChangeData,
   SelectionEvents,
   OptionOnSelectData,
   useIsomorphicLayoutEffect
} from '@fluentui/react-components';

import {
   Key24Regular
} from '@fluentui/react-icons';

import { JoinPath } from '../core/JoinPath';
import { Persona } from '../core/Persona';
import { JoinPageValidator } from '../core/JoinPageValidator';
import { KeyRetriever } from '../core/KeyRetriever';
import { EUIStrings } from './UIStrings';
import { EConfigStrings } from '../core/ConfigStrings';
import { Environment, EEnvironment } from '../core/Environment';
import { innerColumnFooterStyles, textFieldStyles } from './ColumnStyles';
import { throwIfUndefined } from '../core/Asserts';

export interface IJoinPageProps {
   joinPath: JoinPath;  
   joinPersona: Persona;
   onConnect (joinKey: JoinPath) : void;
   onConnectError (hint_: string) : void;    
}

const joinPageInnerStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',  
   },
});

const joinFormRowStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row',    
   },
});

 const buttonDisabledStyles = makeStyles({
   root: {    
      filter: 'grayscale(100%)',
      marginLeft: 'auto', 
      marginRight: '0'
   },
});

const buttonEnabledStyles = makeStyles({
   root: {    
      filter: 'grayscale(0%)',
      marginLeft: 'auto', 
      marginRight: '0'
   },
});

const dropdownStyles = makeStyles({
   root: {
     // Stack the label above the field with a gap
     display: "grid",
     gridTemplateRows: "repeat(1fr)",
     justifyItems: "start",
     ...shorthands.gap("2px"),
     maxWidth: "400px",
   },
 });

 function conversationKeyFromName (name: string) : string {
   switch (name) {

      case EUIStrings.kCohort1Team1ConversationName:
         return EConfigStrings.kCohort1Team1ConversationKey;            
      case EUIStrings.kCohort1Team2ConversationName:
         return EConfigStrings.kCohort1Team2ConversationKey;              
      case EUIStrings.kCohort1Team3ConversationName:
         return EConfigStrings.kCohort1Team3ConversationKey;    
      case EUIStrings.kCohort1Team4ConversationName:
         return EConfigStrings.kCohort1Team4ConversationKey;      
      case EUIStrings.kCohort1ConversationName:
      default:
         return EConfigStrings.kCohort1ConversationKey;                
      }   
 }


export const JoinRow = (props: IJoinPageProps) => {

   const joinPageInnerClasses = joinPageInnerStyles();   
   const joinFormRowClasses = joinFormRowStyles();
   const innerColumnFooterClasses = innerColumnFooterStyles(); 
   const stretchClasses = textFieldStyles();
   const buttonDisabledClasses = buttonDisabledStyles();
   const buttonEnabledClasses = buttonEnabledStyles();
   const dropdownClasses = dropdownStyles();

   const retriever = new KeyRetriever();

   /*
    * @param amLocal
    * All this logic with amLocal is bcs when running against a local fluid framework, we dont know the container ID
    * we have to let the code create a new container then share it manually in the URL#string
    * In production, we have well known container IDs which were created beforehand.
   */
   let amLocal = Environment.environment() === EEnvironment.kLocal;

   let path = props.joinPath;
   let defaultConversationName = EUIStrings.kCohort1ConversationName;

   if ((!path.hasSessionAndConversation) && (!amLocal)) {
      path = JoinPath.makeFromTwoParts (props.joinPath.sessionId, EConfigStrings.kCohort1ConversationKey);
   }
   const [joinPath, setJoinPath] = useState<JoinPath>(path);
   const [joinPathText, setJoinPathText] = useState<string>(path.asString);   
   const [canJoin, setCanJoin] = useState<boolean>(path.isValid);

   let conversations  = [
      EUIStrings.kCohort1ConversationName,
      EUIStrings.kCohort1Team1ConversationName,
      EUIStrings.kCohort1Team2ConversationName,
      EUIStrings.kCohort1Team3ConversationName,
      EUIStrings.kCohort1Team4ConversationName
    ];

    if (amLocal) {
       conversations.push (EUIStrings.kTestConversationName);
    }

    const [selectedConversationNames, setSelectedConversationNames] = React.useState<string[]>([
      defaultConversationName
    ]);
    const [conversationName, setConversationName] = React.useState<string>(defaultConversationName);
  
    function onConversationSelect (ev: SelectionEvents, data: OptionOnSelectData) {

      let conversationName = data.optionText;

      setSelectedConversationNames(data.selectedOptions);
      throwIfUndefined (conversationName); // Make compiler happy for next line
      setConversationName(conversationName);

      var newJoinPath: JoinPath;

      if (amLocal && conversationName === EUIStrings.kTestConversationName) {
         newJoinPath = props.joinPath;
      }
      else {
         let conversationKey = conversationKeyFromName (conversationName);
         newJoinPath = JoinPath.makeFromTwoParts (joinPath.sessionId, conversationKey);
      }
      setJoinPath (newJoinPath);
      setJoinPathText(newJoinPath.asString);      
    };

   function onKeyChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      let newPath = new JoinPath (data.value);

      // If we have a full valid session key for the first part, and we are running
      // against production, complete the full path
      if (newPath.hasSessionOnly && newPath.isValid && (!amLocal)) {
         newPath = JoinPath.makeFromTwoParts (data.value, joinPath.conversationId);
      }

      setJoinPath(newPath);
      setJoinPathText(data.value);
      setCanJoin (newPath.isValid);
   }   

   function onTryJoin(ev: MouseEvent<HTMLImageElement>): void {
      
      ev.preventDefault();

      tryToJoin();
   }

   function tryToJoin () : void {
      
      var url: string;

      if (amLocal)
         url = EConfigStrings.kRequestLocalJoinKeyUrl;
      else
         url = EConfigStrings.kRequestJoinKeyUrl;

      retriever.requestKey (url, 
         EConfigStrings.kRequestKeyParameterName, 
         joinPath.sessionId)
      .then (
         (returnedKey: string):void => {
            props.onConnect(joinPath);
          },
          (e: any) => {
            props.onConnectError(e.toString());
          }
      );
   }

   let joinValidator = new JoinPageValidator ();

   if (joinValidator.isJoinAttemptReady (props.joinPersona.name, props.joinPath)) {
      return (<div></div>);
   }
   else {
      return (
         <div className={innerColumnFooterClasses.root} >               
            <div className={joinPageInnerClasses.root}>  
               &nbsp;              
               <div className={joinFormRowClasses.root}>             
                  <Text align="start" className={stretchClasses.root}>{EUIStrings.kJoinPagePreamble}</Text> 
               </div>             
               &nbsp;         
               <div className={joinFormRowClasses.root}>                   
                  <Tooltip withArrow content={EUIStrings.kJoinConversationKeyPrompt} relationship="label">
                     <Input aria-label={EUIStrings.kJoinConversationKeyPrompt}
                        className={stretchClasses.root}                  
                        required={true}                  
                        value={joinPathText}
                        maxLength={75}
                        contentBefore={<Key24Regular />}
                        placeholder={EUIStrings.kJoinConversationKeyPlaceholder}
                        onChange={onKeyChange}
                        disabled={false}
                        autoFocus={true}
                     />
               </Tooltip>  
               </div>
               &nbsp;
               <div className={joinFormRowClasses.root}>     
                  <div className={dropdownClasses.root}>              
                     <Tooltip withArrow content={EUIStrings.kJoinConversationPicker} relationship="label">
                        <Dropdown
                           defaultValue={EUIStrings.kCohort1ConversationName}
                           defaultSelectedOptions={[EUIStrings.kCohort1ConversationName]}
                           onOptionSelect={onConversationSelect}
                           {...props}
                        >
                           {conversations.map((conversation) => (
                              <Option key={conversation}>
                                 {conversation}
                              </Option>
                           ))}
                        </Dropdown>
                     </Tooltip>      
                  </div>
               </div>          
               &nbsp;                  
               <div className={joinFormRowClasses.root}>               
                  <Tooltip withArrow content={EUIStrings.kJoinConversationWithLinkedInPrompt} relationship="label">
                     <Image className={canJoin? buttonEnabledClasses.root : buttonDisabledClasses.root}
                        alt={EUIStrings.kJoinConversationWithLinkedInPrompt}
                        src="assets/img/SignInWithLinkedIn.png"
                        onClick={onTryJoin}
                     />
                  </Tooltip>                
               </div>               
               &nbsp;                   
               <div className={joinFormRowClasses.root}> 
                  <Text className={stretchClasses.root}>{canJoin ? EUIStrings.kJoinConversationLooksLikeKeyOk : EUIStrings.kJoinConversationDoesNotLookLikeKey}</Text>   
               </div>
               &nbsp;                
            </div>                          
         </div>
      );
   };
}
