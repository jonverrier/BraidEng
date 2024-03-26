/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, KeyboardEvent, MouseEvent, useState } from 'react';

// Fluent
import {
   makeStyles, Button, ButtonProps, Tooltip,
   Text, Input, Image, 
   InputOnChangeData
} from '@fluentui/react-components';

import {
   Person24Regular,
   Key24Regular,
   Send24Regular
} from '@fluentui/react-icons';

import { JoinPath } from '../core/JoinPath';
import { Persona } from '../core/Persona';
import { JoinPageValidator } from '../core/JoinPageValidator';
import { KeyRetriever } from '../core/KeyRetriever';
import { EUIStrings } from './UIStrings';
import { EConfigStrings } from '../core/ConfigStrings';
import { Environment, EEnvironment } from '../core/Environment';
import { innerColumnFooterStyles, textFieldStyles } from './ColumnStyles';

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

const JoinButton: React.FC<ButtonProps> = (props) => {
   return (
     <Button
       {...props}
       appearance="transparent"
       icon={<Send24Regular />}
       size="medium"
     />
   );
 };

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

export const JoinRow = (props: IJoinPageProps) => {

   const joinPageInnerClasses = joinPageInnerStyles();   
   const joinFormRowClasses = joinFormRowStyles();
   const innerColumnFooterClasses = innerColumnFooterStyles(); 
   const stretchClasses = textFieldStyles();
   const buttonDisabledClasses = buttonDisabledStyles();
   const buttonEnabledClasses = buttonEnabledStyles();

   const retriever = new KeyRetriever();

   const [joinKey, setJoinKey] = useState<JoinPath>(props.joinPath);
   const [joinKeyText, setJoinKeyText] = useState<string>(props.joinPath.asString);   
   const [canJoin, setCanJoin] = useState<boolean>(props.joinPath.isValid);

   function onKeyChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      let asKey = new JoinPath (data.value);

      setJoinKey(asKey);
      setJoinKeyText(data.value);
      setCanJoin (asKey.isValid);
   }   

   function onTryJoin(ev: MouseEvent<HTMLImageElement>): void {
      
      ev.preventDefault();

      tryToJoin();
   }

   function tryToJoin () : void {

      var url: string;

      if (Environment.environment() === EEnvironment.kLocal)
         url = EConfigStrings.kRequestLocalJoinKeyUrl;
      else
         url = EConfigStrings.kRequestJoinKeyUrl;

      retriever.requestKey (url, 
         EConfigStrings.kRequestKeyParameterName, 
         joinKey.firstPart)
      .then (
         (returnedKey: string):void => {
            props.onConnect(joinKey);
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
                        value={joinKeyText}
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
