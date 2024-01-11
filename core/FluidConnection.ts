// Copyright (c) 2023 TXPCo Ltd
import { IFluidContainer, ConnectionState, SharedMap, IValueChanged } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";

import { Interest, NotificationFor, Notifier } from './NotificationFramework';
import { Persona } from './Persona';
import { ConnectionError, InvalidOperationError } from './Errors';
import { ClientProps } from './FluidConnectionProps';
import { CaucusOf } from './CaucusFramework';

export interface IConnectionProps {
}

const containerSchema = {
   initialObjects: {
      participantMap: SharedMap,
      shapeMap: SharedMap
   }
};

export class FluidConnection extends Notifier {

   public static connectedNotificationId = "connected";
   public static connectedInterest = new Interest(FluidConnection.connectedNotificationId);

   _props: IConnectionProps;
   _localUser: Persona;
   _client: AzureClient;
   _container: IFluidContainer;
   _participantCaucus: CaucusOf<Persona>;

   constructor(props: IConnectionProps) {

      super();

      this._client = null;
      this._props = props;
      this._container = null;
      this._localUser = null;
      this._participantCaucus = null;

   }

   async createNew(localUser: Persona): Promise<string> {

      try {
         var clientProps: ClientProps = new ClientProps();

         await clientProps.connection.makeTokenProvider();

         this._client = new AzureClient(clientProps);

         this._localUser = localUser;

         const { container, services } = await this._client.createContainer(containerSchema);
         this._container = container;

         let self = this;

         return new Promise<string>((resolve, reject) => {
            // Attach _container to service and return assigned ID
            const containerIdPromise = container.attach();

            containerIdPromise.then((containerId) => {
               self.setupAfterConnection(containerId, true);

               resolve (containerId);
            }).catch(() => {
               reject ();
            });
         });
      }
      catch (e: any) {
         throw new ConnectionError("Error connecting new container to remote data service: " + e ? e.message : "(no details found)");
      }
   }

   async attachToExisting(containerId: string, localUser: Persona): Promise<string> {

      try {
         var clientProps: ClientProps = new ClientProps();

         await clientProps.connection.makeTokenProvider();

         this._client = new AzureClient(clientProps);

         this._localUser = localUser;

         const { container, services } = await this._client.getContainer(containerId, containerSchema);
         this._container = container;

         this.setupAfterConnection(containerId, false);

         return containerId;
      }
      catch (e: any) {
         throw new ConnectionError("Error attaching existing container to remote data service: " + e ? e.message : "(no details found)")
      }
   }

   // local function to cut down duplication between createNew() and AttachToExisting())
   private setupAfterConnection(id: string, creating: boolean): void {

      // Create caucuses so they exist when observers are notified of connection
      this._participantCaucus = new CaucusOf<Persona>(this._container.initialObjects.participantMap as SharedMap);

      // Notify observers we are connected
      // They can then hook up their own observers to the caucus,
      this.notifyObservers(FluidConnection.connectedInterest, new NotificationFor<string>(FluidConnection.connectedInterest, id));

      // Connect our own user ID to the caucus
      var storedVal: string = this._localUser.flatten();
      (this._container.initialObjects.participantMap as SharedMap).set(this._localUser.id, storedVal);
   }


   canDisconnect(): boolean {

      if (!this._container)
         return false;

      var state = this._container.connectionState;
      if (state !== ConnectionState.Connected)
         return false;

      return true;
   }

   async disconnect(): Promise<boolean> {

      if (this.canDisconnect()) {
         await this._container.disconnect();

         this._participantCaucus = null;

         return true;
      }
      else {
         throw new InvalidOperationError("The remote data service is not connected - please try again in a short while.")
      }
   }

   participantCaucus(): CaucusOf<Persona> {
      return this._participantCaucus;
   }

}

