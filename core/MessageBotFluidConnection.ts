// Copyright (c) 2024 Braid Technologies Ltd

import { SharedMap } from "fluid-framework";import { Persona } from './Persona';
import { Message } from './Message';
import { IConnectionProps, FluidConnection } from './FluidConnection';
import { CaucusOf } from './CaucusFramework';
import { throwIfUndefined } from './Asserts'; 
import { EConfigStrings } from "./ConfigStrings";
import { EIcon } from "./Icons";



const containerSchema = {
   initialObjects: {
      participantMap: SharedMap,
      messageMap: SharedMap
   }
};

// MessageBotFluidConnection - concrete derived class of FluidConnection
// connects the fluid connection to two local caucuses - one for participants, another for messages
export class MessageBotFluidConnection extends FluidConnection {

   _initialObjects: any;
   _localUser: Persona;
   _participantCaucus: CaucusOf<Persona> | undefined;
   _messageCaucus: CaucusOf<Message> | undefined;

   constructor(props: IConnectionProps, localUser_: Persona) {

      super(props);

      this._initialObjects = undefined;
      this._participantCaucus = undefined;
      this._messageCaucus = undefined;   
      this._localUser = localUser_;   
   }

   schema() : any {
      return containerSchema;
   }

   // This menas the list of Messages is ordered by send time ascending
   compareFn (a: Message, b: Message) : number {
      return a.sentAt.getTime() - b.sentAt.getTime();
   }

   setupLocalCaucuses (initialObjects_: any) : void {

      this._initialObjects = initialObjects_;

      // Create caucuses so they exist when observers are notified of connection
      this._participantCaucus = new CaucusOf<Persona>(initialObjects_.participantMap as SharedMap);
      this._messageCaucus = new CaucusOf<Message>(initialObjects_.messageMap as SharedMap, this.compareFn);  
      
      this.setInitialValues(initialObjects_.participantMap as SharedMap);

      let self = this;

      setInterval(() => {
         self.checkAddAddSelfToAudience(initialObjects_.participantMap as SharedMap);
       }, 10000);
   }

   participantCaucus(): CaucusOf<Persona> {
      throwIfUndefined (this._participantCaucus);
      return this._participantCaucus;
   }

   messageCaucus(): CaucusOf<Message> {
      throwIfUndefined (this._messageCaucus);
      return this._messageCaucus;
   }    
   
   resetAll () : void {

      throwIfUndefined (this._participantCaucus);      
      this._participantCaucus.removeAll ();

      throwIfUndefined (this._messageCaucus);
      this._messageCaucus.removeAll ();      
      
      this.setInitialValues (this._initialObjects.participantMap as SharedMap)
   }

   private setInitialValues (participantMap: SharedMap): void {
    
      this.checkAddAddSelfToAudience (participantMap);

      // Add the Bot persona if its not already there
      if (! participantMap.get(EConfigStrings.kBotGuid)) {

         let botPersona = new Persona (EConfigStrings.kBotGuid, EConfigStrings.kBotName, EIcon.kBotPersona, undefined, new Date());
         let storedBot = botPersona.flatten();
         participantMap.set(botPersona.id, storedBot);            
      }
   }

   private checkAddAddSelfToAudience (participantMap: SharedMap): void {

      if (! participantMap.get(this._localUser.id)) {

         // Connect our own user ID to the participant caucus      
         let storedMe = this._localUser.flatten();
         participantMap.set(this._localUser.id, storedMe);            
      }
   }   
}

