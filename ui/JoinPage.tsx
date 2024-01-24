/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, useState } from 'react';

// Fluent
import {
   makeStyles, Button, Tooltip,
   Text, Input, 
   InputOnChangeData
} from '@fluentui/react-components';

import {
   Person24Regular,
   Key24Regular
} from '@fluentui/react-icons';

import { JoinPageValidator } from '../core/JoinPageValidator';
import { EUIStrings } from './UIStrings';
import { EConfigStrings } from './ConfigStrings';

export interface IJoinPageProps {
   conversationKey: string;  
   onConnect (key_: string) : void;
   onConnectError (hint_: string) : void;    
}

const viewOuterStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '5px',
      paddingRight: '5px',
      paddingTop: '5px',
      paddingBottom: '5px',
      textAlign: 'left',
      alignItems: 'bottom',      
      width: "100%"         
   },
});

const formStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      textAlign: 'left',
      alignItems: 'bottom',
      alignSelf: 'bottom'
   },
});

const nameInputStyles = makeStyles({
   root: {    
      minWidth: '175px',
      maxWidth: '300px',
      alignSelf: 'left'
   },
});

const keyInputStyles = makeStyles({
   root: {    
      minWidth: '350px',
      maxWidth: '600px',
      alignSelf: 'left'
   },
});

const joinButtonStyles = makeStyles({
   root: {    
      maxWidth: '200px',
      alignSelf: 'left'
   },
});

export const JoinPage = (props: IJoinPageProps) => {

   const viewOuterClasses = viewOuterStyles();
   const formClasses = formStyles();   
   const nameInputClasses = nameInputStyles();
   const keyInputClasses = keyInputStyles();
   const joinButtonClasses = joinButtonStyles();
  
   const validator = new JoinPageValidator();

   const [name, setName] = useState<string>("");
   const [key, setKey] = useState<string>("");
   const [canJoin, setCanJoin] = useState<boolean>(false);

   function onJoinAsChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setName(data.value);
      setCanJoin (validator.isJoinAttemptReady (data.value, key));
   }

   function onKeyChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setKey(data.value);
      setCanJoin (validator.isJoinAttemptReady (name, data.value));
   }   

   function onTryJoin(ev: React.MouseEvent<HTMLButtonElement>) : void {

      let onConnect = props.onConnect;
      let onConnectError = props.onConnectError;

      validator.requestConversationKey (EConfigStrings.kRequestKeyUrl, key)
      .then (
         (conversationKey) => {
            onConnect(conversationKey);
          },
          (e) => {
            onConnectError(e.toString());
          }
      );
   }

   if (props.conversationKey.length !== 0) {
      return (<div></div>);
   }
   else {
   return (
      <div className={viewOuterClasses.root} >     
         &nbsp;            
         <Text align="start">{EUIStrings.kJoinPagePreamble}</Text>   
         <div className={formClasses.root}>   
            &nbsp;       
            <Tooltip withArrow content={EUIStrings.kJoinConversationAsPrompt} relationship="label">
               <Input aria-label={EUIStrings.kJoinConversationAsPrompt} 
                  className={nameInputClasses.root}
                  required={true}
                  value={name}
                  maxLength={20}
                  contentBefore={<Person24Regular />}
                  placeholder={EUIStrings.kJoinConversationAsPlaceholder}
                  onChange={onJoinAsChange}
                  disabled={false}
               />
            </Tooltip>      
            &nbsp;   
            <Tooltip withArrow content={EUIStrings.kJoinConversationKeyPrompt} relationship="label">
               <Input aria-label={EUIStrings.kJoinConversationKeyPrompt}
                  className={keyInputClasses.root}                  
                  required={true}                  
                  value={key}
                  maxLength={40}
                  contentBefore={<Key24Regular />}
                  placeholder={EUIStrings.kJoinConversationKeyPlaceholder}
                  onChange={onKeyChange}
                  disabled={false}
               />
            </Tooltip>             
            &nbsp;     
            <Button disabled={(!canJoin) || validator.isBusy()} className={joinButtonClasses.root}
               onClick={onTryJoin}>Join</Button>  
         </div>                   
      </div>
      );
   };
}
