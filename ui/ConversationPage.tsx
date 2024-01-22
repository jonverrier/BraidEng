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

import { EUIStrings } from './UIStrings';
import { EConfigStrings } from './ConfigStrings';

export interface IConversationPageProps {

   conversationKey: string;  
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

export const ConversationPage = (props: IConversationPageProps) => {

   const viewOuterClasses = viewOuterStyles();

   return (
      <div className={viewOuterClasses.root} >     
         
      </div>
      );
}
