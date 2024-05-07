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
      let isStored = participantCaucus.has(EConfigStrings.kLLMGuid);

      if (! isStored ) {

         let botPersona = new Persona (EConfigStrings.kLLMGuid, EConfigStrings.kLLMName, EConfigStrings.kLLMName, EIcon.kLLMPersona, undefined, new Date());
         participantCaucus.add (botPersona.id, botPersona);            
      }
   }

   // Glare is when two drivers point their headlights at each other. 
   // The Glare check is a way to resolve priority - in this case we let the id that is lexically lowe 'win'
   private localWinsGlareCheck (idMe: string, idOther: string) {
      if (idMe < idOther) 
         return true;
      return false;
   }


   private checkAddAddSelfToAudience (participantCaucus: CaucusOf<Persona>): void {

      let isStored = participantCaucus.has(this._localUser.id);

      if (! isStored ) {      
         
         // We look at all participants looking for someine with the same email as us. 
         // If we find one, we do a 'glare' comparison to consistently pick a winner, and the loser of the
         // 'glare' comparison sets their details to those of the winner. 
         let current = participantCaucus.currentAsArray();
         let found = false;

         for (let i = 0; i < current.length && !found; i++) {        
            if ((this._localUser.email === current[i].email ) && 
               (!this.localWinsGlareCheck (this._localUser.id, current[i].id))) { 
               
               // last case is a backwards compatibility hack - we added participants with no name but low UUIDs that keep winning the glare test                     
               if ((current[i].name === undefined) || (current[i].name.length === 0)) {
                  current[i].name = this._localUser.name;
                  participantCaucus.amend (current[i].id, current[i]);
               }
               found = true;
               this._localUser.id = current[i].id; // Need to push the new ID back into our local copy
            }
         }

         if (!found) {
            // Connect our own user ID to the participant caucus      
            participantCaucus.add (this._localUser.id, this._localUser);             
         }
      } 
      else {
         // Check the right name is stored - name changes when the user logs in 
         let stored = participantCaucus.get(this._localUser.id);         
         if ((stored.name !== this._localUser.name) || (stored.email !== this._localUser.email)) {
            participantCaucus.add (this._localUser.id, this._localUser);                 
         }        
      }
   }   
}

