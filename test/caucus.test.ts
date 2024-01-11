// Copyright TXPCo ltd, 2023
import { expect } from 'expect';
import { describe, it } from 'mocha';

import { Persona } from '../core/Persona';
import { Interest, NotificationFor } from '../core/NotificationFramework';
import { FluidConnection } from '../core/FluidConnection';

var myId: string = "1234";
var myName: string = "Jon";
var myThumbnail: string = "abcd";
var myLastSeenAt = new Date();

class MockLocation { // Just create the fields we use in the Mick
   protocol: string;
   host: string;
   hostname: string;
   hash: string;
}

var mockLocation = new MockLocation();

async function wait() {
   await new Promise(resolve => setTimeout(resolve, 500));
}

function onAdd(interest_: Interest, notification_: NotificationFor<string>) : void {

}

function onChange(interest_: Interest, notification_: NotificationFor<string>): void {

}

function onRemove(interest_: Interest, notification_: NotificationFor<string>): void {

}

describe("Caucus", function () {

   this.timeout(10000);

   var newConnection: FluidConnection;
   var persona: Persona;
   var id: string; 

   var oldLocation: any = global.location;

   beforeEach(async () => {

      (global.location as any) = mockLocation;

      this.timeout(10000);
      newConnection = new FluidConnection({});

      persona = new Persona(myId, myName, myThumbnail, myLastSeenAt);
      id = await newConnection.createNew(persona);

      await wait();
   });

   afterEach(async () => {

      (global.location as any) = oldLocation;

      await wait();
      await newConnection.disconnect();
   });

   it("Can create a valid caucus", async function () {

      var workingPersona: Persona = new Persona(persona);

      let caucus = newConnection.participantCaucus();

      caucus.add(workingPersona.id, workingPersona);
      expect(caucus.has(workingPersona.id)).toEqual(true);
      expect(caucus.get(workingPersona.id).equals(workingPersona)).toEqual(true);
      expect(caucus.current().size).toEqual(1);

      workingPersona.name = "Joe";
      caucus.amend(workingPersona.id, workingPersona);
      expect(caucus.get(workingPersona.id).equals(workingPersona)).toEqual(true);

      expect(caucus.get("banana")).toEqual(null);

      caucus.remove(workingPersona.id);
      expect(caucus.has(workingPersona.id)).toEqual(false);
      expect(caucus.current().size).toEqual(0);
    });

   it("Can synchronise", async function () {

      var workingPersona: Persona = new Persona(persona);

      let caucus = newConnection.participantCaucus();

      var synchMap: Map<string, Persona> = new Map<string, Persona>();

      // Sync down to no elements
      caucus.synchFrom(synchMap);
      expect(caucus.current().size === 0).toEqual(true);

      // Sync in a new element
      synchMap.set(workingPersona.id, workingPersona);
      caucus.synchFrom(synchMap);
      expect(caucus.current().size === 1).toEqual(true);
      expect(caucus.get(workingPersona.id).equals(workingPersona)).toEqual(true);

      // Sync in a changed element
      workingPersona.name = "Joe 2";
      caucus.synchFrom(synchMap);
      expect(caucus.current().size === 1).toEqual(true);
      expect(caucus.get(workingPersona.id).equals(workingPersona)).toEqual(true);
   });
});

