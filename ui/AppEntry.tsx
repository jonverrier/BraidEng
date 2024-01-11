/*! Copyright TXPCo 2022 */

// React
import React from 'react';
import { createRoot } from "react-dom/client";

// Other 3rd party imports
import { log, LogLevel, tag } from 'missionlog';

// Local
import { uuid, looksLikeUuid } from '../core/Uuid';
import { Interest, ObserverInterest, NotificationRouterFor, NotificationFor } from '../core/NotificationFramework';
import { CaucusOf } from '../core/CaucusFramework';
import { Persona } from '../core//Persona';
import { FluidConnection } from '../core/FluidConnection';


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

   localUser: Persona | null;
   containerId: string | null;
   fluidConnection: FluidConnection;
   participantCaucus: CaucusOf<Persona> | null;
}


function containerConnectionString(id: string): string {

   return location.protocol + location.hostname + location.pathname + '#' + id;
}

function copyContainerConnectionString(id: string): void {

   navigator.clipboard.writeText(containerConnectionString (id));
}

export class App extends React.Component<IAppProps, AppState> {

   private _initialUser: Persona | null;
   private _router: NotificationRouterFor<string>;
   private _connectedInterest: ObserverInterest;

   constructor(props: IAppProps) {

      super(props);

      // Initialise logging
      log.init({ application: 'DEBUG', notification: 'DEBUG' }, (level, tag, msg, params) => {
         logger[level as keyof typeof logger](tag, msg, params);
      });

      this._initialUser = null;

      var fluidConnection: FluidConnection = new FluidConnection({});
      this._router = new NotificationRouterFor<string>(this.onConnection.bind(this));
      this._connectedInterest = new ObserverInterest(this._router, FluidConnection.connectedInterest);
      fluidConnection.addObserver(this._connectedInterest);

      var hashValue: string = "";

      if (window.location.hash)
         hashValue = window.location.hash.substring(1);
      var looksOk = looksLikeUuid(hashValue);

      this.state = {
         localUser: this._initialUser,
         fluidConnection: fluidConnection,
         participantCaucus: null,
         containerId: looksOk ? hashValue : null
      };

      // Navigate at the end as it uses state
   }

   onConnection(interest: Interest, data: NotificationFor<string>) : void {

      this.setState({
         localUser: this.state.localUser,
         containerId: data.eventData,
         fluidConnection: this.state.fluidConnection,
         participantCaucus: this.state.fluidConnection.participantCaucus()
      });
   }

   render() {
      return (
         <p>
            Hello
         </p> 
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