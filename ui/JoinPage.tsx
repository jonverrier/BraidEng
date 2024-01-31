/*! Copyright Braid Technologies 2022 */

// React
import React, { ChangeEvent, useState } from 'react';

// Fluent
import {
   makeStyles, useId, Button, ButtonProps, Tooltip,
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

export interface IJoinPageProps {
   joinKey: JoinKey;  
   onConnect (joinKey: JoinKey, name: string) : void;
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
      width: "100%"         
   },
});

const formStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'column'
   },
});

const joinRowStyles = makeStyles({
   root: {    
      display: 'flex',
      flexDirection: 'row'
   },
});

const nameInputStyles = makeStyles({
   root: {    
      width: '100%'
   },
});

const keyInputStyles = makeStyles({
   root: {    
      width: '100%'      
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

export const JoinPage = (props: IJoinPageProps) => {

   const viewOuterClasses = viewOuterStyles();
   const formClasses = formStyles();   
   const nameInputClasses = nameInputStyles();
   const JoinRowClasses = joinRowStyles();
   const keyInputClasses = keyInputStyles(); 
  
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

      retriever.requestKey (EConfigStrings.kRequestJoinKeyUrl, 
         EConfigStrings.kRequestKeyParameterName, 
         joinKey.firstPart)
      .then (
         (returnedKey: string):void => {
            props.onConnect(joinKey, name);
          },
          (e) => {
            props.onConnectError(e.toString());
          }
      );
   }

   if (props.joinKey.isValid) {
      return (<div></div>);
   }
   else {
      return (
         <div className={viewOuterClasses.root} >     
            &nbsp;            
            <Text align="start">{EUIStrings.kJoinPagePreamble}</Text>   
            <div className={formClasses.root}>   
               &nbsp;         
               <Tooltip withArrow content={EUIStrings.kJoinConversationKeyPrompt} relationship="label">
                  <Input aria-label={EUIStrings.kJoinConversationKeyPrompt}
                     className={keyInputClasses.root}                  
                     required={true}                  
                     value={joinKeyText}
                     maxLength={75}
                     contentBefore={<Key24Regular />}
                     placeholder={EUIStrings.kJoinConversationKeyPlaceholder}
                     onChange={onKeyChange}
                     disabled={false}
                  />
               </Tooltip>  
               &nbsp;
               <div className={JoinRowClasses.root}>               
                  <Tooltip withArrow content={EUIStrings.kJoinConversationAsPrompt} relationship="label">
                     <Input aria-label={EUIStrings.kJoinConversationAsPrompt} 
                        className={nameInputClasses.root}
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
            </div>     
            &nbsp;                          
            <Text align="start">{canJoin ? EUIStrings.kJoinConversationLooksLikeKeyAndName : EUIStrings.kJoinConversationDoesNotLookLikeKeyAndName}</Text>   
         </div>
      );
   };
}
