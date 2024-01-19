/*! Copyright TXPCo 2022 */

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
            <div className={headerClasses.root}>
               &nbsp;
               <Text align="justify">{EStrings.kJoinPagePreamble}</Text>
               &nbsp;    
            </div> 
            <div className={formClasses.root}>   
            &nbsp;       
            <Tooltip withArrow content={EStrings.kJoinConversationAsPrompt} relationship="label">
                  <Input id={nameInputId} aria-label={EStrings.kJoinConversationAsPrompt} 
                     className={nameInputClasses.root}
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
                     className={keyInputClasses.root}                  
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
            <Button {...props} className={joinButtonClasses.root}>Join</Button>  
            </div>           
         </div>
         <div className={rightColumnClasses.root}></div>           
      </div>
      );
}
