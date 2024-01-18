/*! Copyright TXPCo 2022 */

// React
import React, { ChangeEvent, useState } from 'react';

// Fluent
import {
   makeStyles, Button, Tooltip,
   useId, Input, 
   InputOnChangeData
} from '@fluentui/react-components';

import {
   Person24Regular
} from '@fluentui/react-icons';

import { EStrings } from './UIStrings';
export interface IJoinPageProps {

}

const viewOuterStyles = makeStyles({
   root: {
      height: '100vh', /* fill the screen with flex layout */ 
      paddingLeft: '5px',
      paddingRight: '5px',
      paddingTop: '5px',
      paddingBottom: '5px'
   },
});

const centerColumnStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'row',
      alignSelf: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      alignItems: 'center'
   },
});

export const JoinPage = (props: IJoinPageProps) => {

   const viewOuterClasses = viewOuterStyles();
   const centerControlClasses = centerColumnStyles();

   const nameInputId = "nameInputId";
   
   const [name, setName] = useState<string>("");

   function onJoinAsChange(ev: ChangeEvent<HTMLInputElement>, data: InputOnChangeData): void {

      setName(data.value);
      // joinPrompt = joinPromptFromName(name, joinPromptEnabled, joinPromptDisabled);
   }

   return (
      <div className={viewOuterClasses.root} >        
         <div className={centerControlClasses.root}>
            <Tooltip withArrow content={EStrings.kJoinConversationAsPrompt} relationship="label">
                  <Input id={nameInputId} aria-label={EStrings.kJoinConversationAsPrompt}
                     value={name}
                     contentBefore={<Person24Regular />}
                     placeholder={EStrings.kJoinConversationAsPlaceholder}
                     onChange={onJoinAsChange}
                     disabled={false}
                  />
            </Tooltip>           
            <p>
               Join Page
            </p> 
         </div>
      </div>
      );
}
