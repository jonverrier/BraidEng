// Copyright (c) 2024 Braid Technologies Ltd
import { IFluidContainer, ConnectionState } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";

import { Interest, NotificationFor, Notifier } from './NotificationFramework';
import { ConnectionError, InvalidOperationError, InvalidStateError} from './Errors';
import { ClientProps } from './FluidConnectionProps';

export interface IConnectionProps {
}


export abstract class FluidConnection extends Notifier {

   public static connectedNotificationId = "connected";
   public static connectedInterest = new Interest(FluidConnection.connectedNotificationId);

   _props: IConnectionProps;
   _client: AzureClient | undefined;
   _container: IFluidContainer | undefined;

   constructor(props: IConnectionProps) {

      super();

      this._client = undefined;
      this._props = props;
      this._container = undefined;
   }

   async createNew(joinKey_: string): Promise<string> {

      try {
         var clientProps: ClientProps = new ClientProps();

         await clientProps.connection.makeTokenProvider(joinKey_);

         this._client = new AzureClient(clientProps);



         const { container, services } = await this._client.createContainer(this.schema());
         this._container = container;

         let self = this;

         return new Promise<string>((resolve, reject) => {
            // Attach _container to service and return assigned ID
            const containerIdPromise = container.attach();

            containerIdPromise.then((containerId) => {
               if (this._container) {
                  self.setupAfterConnection(containerId, this._container);
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

   async attachToExisting(joinKey_: string, containerId: string): Promise<string> {

      try {
         var clientProps: ClientProps = new ClientProps();

         await clientProps.connection.makeTokenProvider(joinKey_);

         this._client = new AzureClient(clientProps);

         const { container, services } = await this._client.getContainer(containerId, this.schema());
         this._container = container;

         this.setupAfterConnection(containerId, this._container);

         return containerId;
      }
      catch (e: any) {
         throw new ConnectionError("Error attaching existing container to remote data service: " + e ? e.message : "(no details found)")
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

         return true;
      }
      else {
         throw new InvalidOperationError("The remote data service is not connected.")
      }
   }

   // local function to cut down duplication between createNew() and AttachToExisting())
   private setupAfterConnection(id: string, container: IFluidContainer): void {

      // Create caucuses so they exist when observers are notified of connection
      this.setupLocalCaucuses (container.initialObjects);

      // Notify observers we are connected
      // They can then hook up their own observers to the caucus,
      this.notifyObservers(FluidConnection.connectedInterest, new NotificationFor<string>(FluidConnection.connectedInterest, id));
   }

   abstract schema() : any;
   abstract setupLocalCaucuses(initialObjects: any) : void;
}



