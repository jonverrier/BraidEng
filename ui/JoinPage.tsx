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
    onConnect (key_: string) : void;
    onConnectError (hint_: string) : void;    
}

const viewOuterStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'row',
      height: '100vh', /* fill the screen with flex layout */ 
      paddingLeft: '5px',
      paddingRight: '5px',
      paddingTop: '5px',
      paddingBottom: '5px',
      textAlign: 'center',
      alignItems: 'top'      
   },
});

const leftColumnStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      width: '10%',
      alignSelf: 'left',
      marginLeft: '0',
      marginRight: 'auto'
   },
});

const rightColumnStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      width: '10%',
      alignSelf: 'right',
      marginLeft: 'auto',
      marginRight: '0'
   },
});

const centerColumnStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',
      marginLeft: '0px',
      marginRight: '0px'
   },
});

const headerStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      textAlign: 'center',
      alignItems: 'center'
   },
});

const formStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column',      
      textAlign: 'left',
      alignItems: 'left'
   },
});

const nameInputStyles = makeStyles({
   root: {    
      minWidth: '200px',
      maxWidth: '400px',
      alignSelf: 'left'
   },
});

const keyInputStyles = makeStyles({
   root: {    
      minWidth: '400px',
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
   const leftColumnClasses = leftColumnStyles();
   const centerColumnClasses = centerColumnStyles();
   const rightColumnClasses = rightColumnStyles();
   const headerClasses = headerStyles();    
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

   return (
      <div className={viewOuterClasses.root} >     
         <div className={leftColumnClasses.root}></div>         
         <div className={centerColumnClasses.root}>
            <div className={headerClasses.root}>
               &nbsp;
               <Text align="justify">{EUIStrings.kJoinPagePreamble}</Text>
               &nbsp;    
            </div> 
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
            <Button disabled={!canJoin} className={joinButtonClasses.root}
            onClick={onTryJoin}>Join</Button>  
            </div>           
         </div>
         <div className={rightColumnClasses.root}></div>           
      </div>
      );
}
