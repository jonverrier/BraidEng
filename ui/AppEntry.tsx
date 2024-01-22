/*! Copyright Braid Technologies 2022 */

// React
import React, { useState } from 'react';
import { createRoot } from "react-dom/client";

// Fluent
import {
   FluentProvider, teamsDarkTheme, makeStyles
} from '@fluentui/react-components';

// Other 3rd party imports
import { log, LogLevel, tag } from 'missionlog';

// Local
import { EConfigStrings } from './ConfigStrings';
import { EMainPageMessageTypes, MainPageMessage } from './MainPageMessage';
import { JoinPage } from './JoinPage';
import { EUIStrings } from './UIStrings';


// Logging handler
const logger = {
   [LogLevel.ERROR]: (tag, msg, params) => console.error(msg, ...params),
   [LogLevel.WARN]: (tag, msg, params) => console.warn(msg, ...params),
   [LogLevel.INFO]: (tag, msg, params) => console.log(msg, ...params),
   [LogLevel.TRACE]: (tag, msg, params) => console.log(msg, ...params),
   [LogLevel.DEBUG]: (tag, msg, params) => console.log(msg, ...params),
} as Record<LogLevel, (tag: string, msg: unknown, params: unknown[]) => void>;

export interface IAppProps {

}

class AppState {
   key: string;
   lastError: string;
}

const pageOuterStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh' /* fill the screen with flex layout */    
   },
});

export const App = (props: IAppProps) => {
   
   const [lastMessage, setLastMessage] = useState<string>("");
   const [lastMessageType, setLastMessageType] = useState<EMainPageMessageTypes> (EMainPageMessageTypes.kNothing);
   const [key, setKey] = useState<string>("");

   const pageOuterClasses = pageOuterStyles();

   // Initialise logging
   log.init({ application: 'DEBUG', notification: 'DEBUG' }, (level, tag, msg, params) => {
      logger[level as keyof typeof logger](tag, msg, params);
   });

   function onConnect (key_: string) : void  {
      setKey (key_);
   }

   function onConnectError (hint_: string) : void  {

      let params = new Array();
      params.length = 1;
      params[0] = hint_;

      logger.INFO (EConfigStrings.kApiLogCategory, "Error connecting to conversation.", params);

      setLastMessage (EUIStrings.kJoinApiError);
      setLastMessageType (EMainPageMessageTypes.kError);
   }

   return (
         <FluentProvider theme={teamsDarkTheme} >
            
            <div className={pageOuterClasses.root}>

               <MainPageMessage 
                  intent={lastMessageType} 
                  text={lastMessage} />

               <JoinPage onConnect={onConnect} onConnectError={onConnectError}></JoinPage>

            </div>
         </FluentProvider>         
      );
}

// This allows code to be loaded in node.js for tests, even if we dont run actual React methods
if (document !== undefined && document.getElementById !== undefined) {
   const root = createRoot(document.getElementById("reactRoot") as HTMLElement);
   root.render(
      <App />
   ); 

}