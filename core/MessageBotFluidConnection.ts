// Copyright (c) 2024 Braid Technologies Ltd

import { SharedMap } from "fluid-framework";import { Persona } from './Persona';
import { Message } from './Message';
import { IConnectionProps, FluidConnection } from './FluidConnection';
import { CaucusOf } from './CaucusFramework';
import { MDynamicStreamable } from "./StreamingFramework";
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
      
      this.setInitialValues(this._participantCaucus);

      let self = this;

      setInterval(() => {
         throwIfUndefined(self._participantCaucus);
         self.checkAddAddSelfToAudience(self._participantCaucus);
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

   resetMessages () : void {

      throwIfUndefined (this._messageCaucus);      
      this._messageCaucus.removeAll ();    
      
      throwIfUndefined (this._participantCaucus);  
      this._participantCaucus.removeAll ();

      this.setInitialValues (this._participantCaucus);
   }

   private setInitialValues (participantCaucus: CaucusOf<Persona>): void {
    
      this.checkAddAddSelfToAudience (participantCaucus);

      // Add the Bot persona if its not already there
      let isStored = participantCaucus.has(EConfigStrings.kBotGuid);

      if (! isStored ) {

         let botPersona = new Persona (EConfigStrings.kBotGuid, EConfigStrings.kBotName, EIcon.kLLMPersona, undefined, new Date());
         participantCaucus.add (botPersona.id, botPersona);            
      }
   }

   private checkAddAddSelfToAudience (participantCaucus: CaucusOf<Persona>): void {

      let isStored = participantCaucus.has(this._localUser.id);

      if (! isStored ) {

         // Connect our own user ID to the participant caucus      
         participantCaucus.add (this._localUser.id, this._localUser);            
      } 
      else {
         // Check the right name is stored - name changes as the user types it in the joining form
         let stored = participantCaucus.get(this._localUser.id);         
         if (stored.name !== this._localUser.name) {
            participantCaucus.add (this._localUser.id, this._localUser);                 
         }      
      }
   }   
}

