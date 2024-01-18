/*! Copyright TXPCo 2022 */

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

import { EStrings } from './UIStrings';
export interface IJoinPageProps {

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
      marginRight: '0px',
      textAlign: 'center'
   },
});

export const JoinPage = (props: IJoinPageProps) => {

   const viewOuterClasses = viewOuterStyles();
   const leftColumnClasses = leftColumnStyles();
   const centerColumnClasses = centerColumnStyles();
   const rightColumnClasses = rightColumnStyles();


   const nameInputId = "nameInputId";
   
   const [name, setName] = useState<string>("");
   const [key, setKey] = useState<string>("");

   function onJoinAsChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setName(data.value);
      // joinPrompt = joinPromptFromName(name, joinPromptEnabled, joinPromptDisabled);
   }

   function onKeyChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setKey(data.value);
      // joinPrompt = joinPromptFromName(name, joinPromptEnabled, joinPromptDisabled);
   }   

   return (
      <div className={viewOuterClasses.root} >     
         <div className={leftColumnClasses.root}></div>         
         <div className={centerColumnClasses.root}>
            <Text align="justify">{EStrings.kJoinPagePreamble}</Text>
            &nbsp;               
            <Tooltip withArrow content={EStrings.kJoinConversationAsPrompt} relationship="label">
                  <Input id={nameInputId} aria-label={EStrings.kJoinConversationAsPrompt}
                     required={true}
                     value={name}
                     maxLength={20}
                     contentBefore={<Person24Regular />}
                     placeholder={EStrings.kJoinConversationAsPlaceholder}
                     onChange={onJoinAsChange}
                     disabled={false}
                  />
            </Tooltip>      
            &nbsp;   
            <Tooltip withArrow content={EStrings.kJoinConversationKeyPrompt} relationship="label">
                  <Input id={nameInputId} aria-label={EStrings.kJoinConversationKeyPrompt}
                     required={true}                  
                     value={name}
                     maxLength={40}
                     contentBefore={<Key24Regular />}
                     placeholder={EStrings.kJoinConversationKeyPlaceholder}
                     onChange={onKeyChange}
                     disabled={false}
                  />
            </Tooltip>             
            &nbsp;                  
         </div>
         <div className={rightColumnClasses.root}></div>           
      </div>
      );
}
