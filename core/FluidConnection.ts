// Copyright (c) 2023 TXPCo Ltd
import { IFluidContainer, ConnectionState, SharedMap, IValueChanged } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";

import { throwIfUndefined } from './Asserts'; 
import { Interest, NotificationFor, Notifier } from './NotificationFramework';
import { Persona } from './Persona';
import { ConnectionError, InvalidOperationError, InvalidStateError} from './Errors';
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
   _localUser: Persona | undefined;
   _client: AzureClient | undefined;
   _container: IFluidContainer | undefined;
   _participantCaucus: CaucusOf<Persona> | undefined;

   constructor(props: IConnectionProps) {

      super();

      this._client = undefined;
      this._props = props;
      this._container = undefined;
      this._localUser = undefined;
      this._participantCaucus = undefined;
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
               if (this._container && this._localUser) {
                  self.setupAfterConnection(containerId, true, this._container, this._localUser);
               }
               else {
                  throw new InvalidStateError("FluidConnection has reached inconsistent internal state.");
               }

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

         this.setupAfterConnection(containerId, false, this._container, this._localUser);

         return containerId;
      }
      catch (e: any) {
         throw new ConnectionError("Error attaching existing container to remote data service: " + e ? e.message : "(no details found)")
      }
   }

   // local function to cut down duplication between createNew() and AttachToExisting())
   private setupAfterConnection(id: string, creating: boolean, container: IFluidContainer, localUser: Persona): void {

      // Create caucuses so they exist when observers are notified of connection
      this._participantCaucus = new CaucusOf<Persona>(container.initialObjects.participantMap as SharedMap);

      // Notify observers we are connected
      // They can then hook up their own observers to the caucus,
      this.notifyObservers(FluidConnection.connectedInterest, new NotificationFor<string>(FluidConnection.connectedInterest, id));

      // Connect our own user ID to the caucus
      var storedVal: string = localUser.flatten();
      if (localUser.id) {
         (container.initialObjects.participantMap as SharedMap).set(localUser.id, storedVal);
      }
      else {
         throw new InvalidStateError("FluidConnection has reached inconsistent internal state.");
      }
   }


   canDisconnect(): boolean {

      if (!this._container)
         return false;

      var state = this._container.connectionState;
      if (state !== ConnectionState.Connected)
         return false;

      return true;
   }

   isConnected (): boolean {

      return this.canDisconnect();
   }

   async disconnect(): Promise<boolean> {

      if (this.canDisconnect()) {
         if (this._container) {
            await this._container.disconnect();
         }
         this._participantCaucus = undefined;

         return true;
      }
      else {
         throw new InvalidOperationError("The remote data service is not connected - please try again in a short while.")
      }
   }

   participantCaucus(): CaucusOf<Persona> {
      throwIfUndefined (this._participantCaucus);
      return this._participantCaucus;
   }

}

