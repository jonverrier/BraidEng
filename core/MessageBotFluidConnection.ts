// Copyright (c) 2024 Braid Technologies Ltd

import { SharedMap } from "fluid-framework";import { Persona } from './Persona';
import { Message } from './Message';
import { IConnectionProps, FluidConnection } from './FluidConnection';
import { CaucusOf } from './CaucusFramework';
import { throwIfUndefined } from './Asserts'; 

const containerSchema = {
   initialObjects: {
      participantMap: SharedMap,
      messageMap: SharedMap
   }
};

// MessageBotFluidConnection - concrete derived class of FluidConnection
// connects the fluid connection to two local caucuses - one for participants, another for messages
export class MessageBotFluidConnection extends FluidConnection {

   _localUser: Persona;
   _participantCaucus: CaucusOf<Persona> | undefined;
   _messageCaucus: CaucusOf<Message> | undefined;

   constructor(props: IConnectionProps, localUser_: Persona) {

      super(props);

      this._participantCaucus = undefined;
      this._messageCaucus = undefined;   
      this._localUser = localUser_;   
   }

   schema() : any {
      return containerSchema;
   }

   setupLocalCaucuses (initialObjects: any) : void {
      // Create caucuses so they exist when observers are notified of connection
      this._participantCaucus = new CaucusOf<Persona>(initialObjects.participantMap as SharedMap);
      this._messageCaucus = new CaucusOf<Message>(initialObjects.messageMap as SharedMap);  
      
      // Connect our own user ID to the participant caucus
      var storedVal: string = this._localUser.flatten();
      (initialObjects.participantMap as SharedMap).set(this._localUser.id, storedVal);      
   }

   participantCaucus(): CaucusOf<Persona> {
      throwIfUndefined (this._participantCaucus);
      return this._participantCaucus;
   }

   messageCaucus(): CaucusOf<Message> {
      throwIfUndefined (this._messageCaucus);
      return this._messageCaucus;
   }      
}

