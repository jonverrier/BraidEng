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
import { EConfigStrings } from '../core/ConfigStrings';
import { Persona } from '../core/Persona';
import { EIcon } from '../core/Icons';
import { JoinPath } from '../core/JoinPath';
import { JoinDetails } from '../core/JoinDetails';
import { EUIStrings } from './UIStrings';
import { innerColumnStyles } from './ColumnStyles';
import { EMainPageMessageTypes, MainPageMessageRow } from './MainPageMessage';
import { JoinRow } from './JoinRow';
import { ConversationControllerRow } from './ConversationController';

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

const pageOuterStyles = makeStyles({
   root: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',  /* for a row, the main axis is vertical, flex-end is items aligned to the bottom of the row */
      justifyContent: 'center', /* for a row, the cross-axis is horizontal, center means vertically centered */
      height: '100vh', /* fill the screen with flex layout */ 
      width: '100vw',  /* fill the screen with flex layout */       
      minHeight: "128px", // Ask for enough for at least the error message
      minWidth: "256px",  // Ask for enough for at least the error message
      marginLeft: '0px',
      marginRight: '0px',
      marginTop: '0px',
      marginBottom: '0px',
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingTop: '20px',
      paddingBottom: '20px',
      webkitTextSizeAdjust: '100%'
   },
});

export const App = (props: IAppProps) => {

   let localPersona = new Persona ();
   localPersona.icon = EIcon.kPersonPersona;

   // This little block attempts to pick up a joinpath from the URL after the #value
   // If it looks valid, we pre-populate the joining form
   // *** BE CAREFUL HERE - CAN GENERATE INFINITE RE_RENDERING ***
   var hashValue: string = "";
   if (window.location.hash)
      hashValue = window.location.hash.substring(1);
   
   let joinAttempt = new JoinDetails (hashValue);
   localPersona.name = joinAttempt.email; 

   const [lastMessage, setLastMessage] = useState<string>("");
   const [lastMessageType, setLastMessageType] = useState<EMainPageMessageTypes> (EMainPageMessageTypes.kNothing);
   const [joinPath, setJoinPath] = useState<JoinPath>(joinAttempt.joinPath);
   const [joinAsPersona, setJoinAsPersona] = useState<Persona>(localPersona);   

   const pageOuterClasses = pageOuterStyles();
   const innerColumnClasses = innerColumnStyles();

   // Initialise logging
   log.init({ application: 'DEBUG', notification: 'DEBUG' }, (level, tag, msg, params) => {
      logger[level as keyof typeof logger](tag, msg, params);
   });

   function onConnect (joinPath_: JoinPath) : void  {
      
      setLastMessage ("");
      setLastMessageType (EMainPageMessageTypes.kNothing);      

      setJoinPath (joinPath_);

      // Start the login process by redirecting to the login API
      let query = JoinDetails.makeAsString ("", joinPath_);
      location.replace ("/api/login" + '?' + query);
   }

   function onConnectError (hint_: string) : void  {

      let params = new Array();
      params.length = 1;
      params[0] = hint_;

      logger.ERROR (EConfigStrings.kApiLogCategory, "Error connecting to conversation.", params);

      setLastMessage (EUIStrings.kJoinApiError);
      setLastMessageType (EMainPageMessageTypes.kError);
   }

   function onFluidError (hint_: string) : void  {

      let params = new Array();
      params.length = 1;
      params[0] = hint_;

      logger.INFO (EConfigStrings.kApiLogCategory, "Error joining remote conversation.", params);

      setLastMessage (EUIStrings.kJoinApiError);
      setLastMessageType (EMainPageMessageTypes.kError);

      // Clear the join key - takes up back to the join page.
      setJoinPath (new JoinPath (""));
   }
   
   function onAiError (hint_: string) : void  {

      let params = new Array();
      params.length = 1;
      params[0] = hint_;

      logger.INFO (EConfigStrings.kApiLogCategory, "Error connecting to AI.", params);

      setLastMessage (EUIStrings.kAiApiError);
      setLastMessageType (EMainPageMessageTypes.kError);
   }

   function onDismissMessage () : void {

      setLastMessage ("");
      setLastMessageType (EMainPageMessageTypes.kNothing);
   }

   return (
         <FluentProvider theme={teamsDarkTheme} >            
            <div className={pageOuterClasses.root}>    
               <div className={innerColumnClasses.root}>             
      
                  <MainPageMessageRow 
                     intent={lastMessageType} 
                     text={lastMessage} 
                     onDismiss={onDismissMessage}/>
      
                  <ConversationControllerRow 
                     joinPath={joinPath}
                     localPersona={joinAsPersona}
                     onFluidError={onFluidError}
                     onAiError={onAiError}>                           
                  </ConversationControllerRow>      

                  <JoinRow 
                     joinPath={joinPath} 
                     joinPersona={joinAsPersona}                     
                     onConnect={onConnect} 
                     onConnectError={onConnectError}>                     
                  </JoinRow>   

               </div>
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