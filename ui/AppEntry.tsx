/*! Copyright TXPCo 2022 */

// React
import React from 'react';
import { createRoot } from "react-dom/client";

// Fluent
import {
   FluentProvider, teamsDarkTheme
} from '@fluentui/react-components';

// Other 3rd party imports
import { log, LogLevel, tag } from 'missionlog';

// Local
import { JoinPage } from './JoinPage';


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

}

export class App extends React.Component<IAppProps, AppState> {
   
   constructor(props: IAppProps) {

      super(props);

      // Initialise logging
      log.init({ application: 'DEBUG', notification: 'DEBUG' }, (level, tag, msg, params) => {
         logger[level as keyof typeof logger](tag, msg, params);
      });
   }

   render() {
      return (
         <FluentProvider theme={teamsDarkTheme} >
            <JoinPage></JoinPage>
         </FluentProvider>         
      );
   }
}

// This allows code to be loaded in node.js for tests, even if we dont run actual React methods
if (document !== undefined && document.getElementById !== undefined) {
   const root = createRoot(document.getElementById("reactRoot") as HTMLElement);
   root.render(
      <App />
   ); 

}