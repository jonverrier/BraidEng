/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, useState } from 'react';

// Fluent
import {
   makeStyles, Button, ButtonProps, Tooltip,
   Text, Input, 
   InputOnChangeData
} from '@fluentui/react-components';

import {
   Person24Regular,
   Key24Regular,
   Send24Regular
} from '@fluentui/react-icons';

import { JoinKey } from '../core/JoinKey';
import { JoinPageValidator } from '../core/JoinPageValidator';
import { KeyRetriever } from '../core/KeyRetriever';
import { EUIStrings } from './UIStrings';
import { EConfigStrings } from '../core/ConfigStrings';
import { Environment, EEnvironment } from '../core/Environment';
import { innerColumnFooterStyles, textFieldStyles } from './ColumnStyles';

export interface IJoinPageProps {
   joinKey: JoinKey;  
   onConnect (joinKey: JoinKey, name: string) : void;
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

export const JoinRow = (props: IJoinPageProps) => {

   const joinPageInnerClasses = joinPageInnerStyles();   
   const joinFormRowClasses = joinFormRowStyles();
   const innerColumnFooterClasses = innerColumnFooterStyles(); 
   const stretchClasses = textFieldStyles();

   const validator = new JoinPageValidator();
   const retriever = new KeyRetriever();

   const [name, setName] = useState<string>("");
   const [joinKey, setJoinKey] = useState<JoinKey>(new JoinKey(""));
   const [joinKeyText, setJoinKeyText] = useState<string>("");   
   const [canJoin, setCanJoin] = useState<boolean>(false);

   function onJoinAsChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setName(data.value);
      setCanJoin (validator.isJoinAttemptReady (data.value, joinKey));
   }

   function onKeyChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      let asKey = new JoinKey (data.value);

      setJoinKey(asKey);
      setJoinKeyText(data.value);
      setCanJoin (validator.isJoinAttemptReady (name, asKey));
   }   

   function onTryJoin(ev: React.MouseEvent<HTMLButtonElement>) : void {

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
            props.onConnect(joinKey, name);
          },
          (e: any) => {
            props.onConnectError(e.toString());
          }
      );
   }

   if (props.joinKey.isValid) {
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
                     />
               </Tooltip>  
               </div>
               &nbsp;
               <div className={joinFormRowClasses.root}>               
                  <Tooltip withArrow content={EUIStrings.kJoinConversationAsPrompt} relationship="label">
                     <Input aria-label={EUIStrings.kJoinConversationAsPrompt} 
                        className={stretchClasses.root}
                        required={true}
                        value={name}
                        maxLength={20}
                        contentBefore={<Person24Regular />}
                        contentAfter={<JoinButton 
                           aria-label={EUIStrings.kSendButtonPrompt} 
                           disabled={(!canJoin) || retriever.isBusy()} 
                           onClick={onTryJoin}
                        />}                
                        placeholder={EUIStrings.kJoinConversationAsPlaceholder}
                        onChange={onJoinAsChange}
                        disabled={false}
                     />
                  </Tooltip>                
               </div>
               &nbsp;                   
               <div className={joinFormRowClasses.root}> 
                  <Text className={stretchClasses.root}>{canJoin ? EUIStrings.kJoinConversationLooksLikeKeyAndName : EUIStrings.kJoinConversationDoesNotLookLikeKeyAndName}</Text>   
               </div>
               &nbsp;                
            </div>                          
         </div>
      );
   };
}
