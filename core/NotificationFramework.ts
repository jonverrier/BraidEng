// NotificationFramework
// Copyright (c) 2023 TXPCo Ltd
/////////////////////////////////////////

// 3rd party imports
import { log, tag } from 'missionlog';

/// <summary>
/// Interest -  encapsulates what is being observed - a specific notificationId.
/// </summary>
export class Interest { 

   private _notificationId: string;

   /**
    * Create a Interest object
    * @param notificationId_ - id of the notification 
    */
   constructor(notificationId_: string);

   /**
    * Create a Interest object
    * @param interest_ - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(interest_: Interest);

   /**
    * Create an empty Interest object - required for particiation in serialisation framework
    */
   constructor ();

   constructor(...arr: any[]) { 
      if (arr.length === 0) { // Empty Constructor
         this._notificationId = null;
         return;
      }
      else {
         if (this.isMyType(arr[0])) { // Copy Constructor
            this._notificationId = arr[0]._notificationId;
         }
         else { // Individual arguments
            this._notificationId = arr[0];
         }
      }
   }

   private isMyType(rhs: Interest): boolean {
      return rhs.hasOwnProperty('_notificationId');
   }

   /**
   * set of 'getters' for private variables
   */
   get notificationId(): string {
      return this._notificationId;
   }

   /**
    * test for equality - checks all fields are the same. 
    * NB must use field values, not identity bcs if objects are streamed to/from JSON, identities will be different. 
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: Interest): boolean {
      
      return (this._notificationId === rhs._notificationId);
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: Interest): Interest {
      this._notificationId = rhs._notificationId;

      return this;
   }

}

/// <summary>
/// Notification -  base class for all events. Base carries references to the notifcationId. derived classes add a data package via template class below.
/// Value class - just holds reference to the data, is expected to exist only for the synchronous life of the notification.
/// </summary>
export class Notification {

   private _interest: Interest;

   /**
    * Create a Notification object
    * @param interest_ - the Interest to identify the notification 
    */
   constructor(interest_: Interest);

   /**
    * Create a Notification object
    * @param notification_ - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(notification_: Notification);

   /**
    * Create an empty Interest object - required for particiation in serialisation framework
    */
   constructor();

   constructor(...arr: any[]) {
      if (arr.length === 0) { // Empty Contrutructor
         this._interest = null;
         return;
      }
      else {
         if (this.isMyType(arr[0])) { // Copy Contrutructor
            this._interest = arr[0]._interest;
         }
         else { // Individual arguments
            this._interest = arr[0];
         }
      }
   }

   private isMyType(rhs: Notification): boolean {
      return rhs.hasOwnProperty('_interest');
   }

   /**
   * set of 'getters' for private variables
   */
   get interest (): Interest {
      return this._interest;
   }

   /**
    * test for equality - checks all fields are the same. 
    * Shallow check.
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: Notification): boolean {

      return (this.interest === rhs.interest) ||
         ((this._interest !== null) && (rhs.interest !== null) && (this._interest.equals(rhs._interest)));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: Notification): Notification {
      this._interest = rhs._interest;

      return this;
   }

}

/// <summary>
/// NotificationFor -  template to specialse Notification by adding an NotificationData class. 
/// Value class - just holds reference to the data, is expected to exist only for the synchronous life of the notification. 
/// If you want data to last longer, add a reference type and the observer will have to save it. 
/// </summary>
export class NotificationFor<EventData> extends Notification
{
   private _eventData: EventData;


   /**
    * Create an empty NotificationFor<NotificationData>  object - required for particiation in serialisation framework
    */
   constructor();

   /**
    * Create a NotificationFor<NotificationData> object
    * @param notification_ - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(notification_: NotificationFor<EventData>);

   /**
    * Create a Notification object
    * @param interest_ - id of the notification 
    * @param eventData_ - the data payload to send with it
    */
   constructor(interest_: Interest, eventData_: EventData) 

   constructor(...arr: any[]) {
      if (arr.length === 0) { // Construct empty
         super();
         this._eventData = null;
         return;
      }
      else 
      if (arr.length === 1) { // Copy constructor
         super (arr[0])
         this._eventData = arr[0]._eventData;
      }
      else { // Individual arguments
         super (arr[0])
         this._eventData = arr[1];
      }
   }

   /**
   * set of 'getters' for private variables
   */
   get eventData(): EventData {
      return this._eventData;
   }

   /**
    * test for equality - checks all fields are the same. 
    * Is a shallow compare if the payload is an object
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: NotificationFor<EventData>): boolean {

      return (super.equals(rhs) &&
         (this._eventData === rhs._eventData));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: NotificationFor<EventData>): NotificationFor<EventData> {
      super.assign(rhs);
      this._eventData = rhs._eventData;

      return this;
   }
}

/// <summary>
/// ObserverInterest -  an IObserver plus an Interest . Used by Notifieres to hold a list of things that observers are interested in so it can notify them. 
/// </summary>
export class ObserverInterest {

   private _observer: IObserver;
   private _interest: Interest;

   /**
    * Create a Interest object
    * @param observer_ - reference to the observer 
    * @param interest_ - the thing it is interested in 
    */
   constructor(_observer: IObserver, _interest: Interest);

   /**
    * Create a ObserverInterest object
    * @param observerInterest - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(observerInterest: ObserverInterest);

   /**
    * Create an empty Interest object - required for particiation in serialisation framework
    */
   constructor();

   constructor(...arr: any[]) {
      if (arr.length === 0) { // Empty constructor
         this._observer = null;
         this._interest = null;
         return;
      }
      if (arr.length === 1) { // Copy constructor
         this._observer = arr[0]._observer;
         this._interest = arr[0]._interest;
      }
      else { // Indivual arguments
         this._observer = arr[0];
         this._interest = arr[1];
      }
   }

   /**
   * set of 'getters' for private variables
   */
   get observer(): IObserver {
      return this._observer;
   }
   get interest(): Interest {
      return this._interest;
   }

   /**
    * test for equality - checks all fields are the same. 
    * Shallow compare
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: ObserverInterest): boolean {

      return ((this._observer === rhs._observer) && 
         ( (this.interest === rhs.interest) ||
           ((this._interest !== null) && (rhs.interest !== null) && (this._interest.equals(rhs._interest)))));
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: ObserverInterest): ObserverInterest {
      this._observer = rhs._observer;
      this._interest = rhs._interest;

      return this;
   }

}

/// <summary>
/// NotificationRouter -  template to act as an intermediary, type-safe router that connects a specific function signature for the method that is called in a notification
/// </summary>
/// 
type FunctionForNotification = (interest: Interest, data: Notification) => void;

export class NotificationRouter implements IObserver {
   private _function: FunctionForNotification;

   /**
    * Create empty NotificationRouterFor object
    */
   constructor();

   /**
    * Create a NotificationRouterFor object
    * @param interest_ - the thing it is interested in 
    */
   constructor(_function: FunctionForNotification);

   /**
    * Create a NotificationRouter  object
    * @param observerRouter - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(observerRouter: NotificationRouter);

   constructor(...arr: any[]) {
      if (arr.length === 0) { // Construct empty
         this._function = null;
         return;
      }
      else {
         if (this.isMyType(arr[0])) { // Copy constructor
            this._function = arr[0]._function;
         }
         else { // Individual arguments
            this._function = arr[0];
         }
      }
   }

   private isMyType(rhs: FunctionForNotification): boolean {
      return rhs.hasOwnProperty('_function');
   }

   /**
   * set of 'getters' for private variables
   */
   get function(): FunctionForNotification {
      return this._function;
   }

   /**
    * test for equality - checks all fields are the same. 
    * Shallow compare
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: NotificationRouter): boolean {

      return (this._function === rhs._function);
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: NotificationRouter): NotificationRouter {
      this._function = rhs._function;

      return this;
   }

   notify(interest_: Interest, notification_: Notification): void {

      // pass on to the required method
      this._function(interest_, notification_);
   }
}


/// <summary>
/// NotificationRouterFor -  template to act as an intermediary, type-safe router that connects a specific function signature for the method that is called in a notification
/// </summary>
/// 
type FunctionFor<NotificationData> = (interest: Interest, data: NotificationFor<NotificationData>) => void;

export class NotificationRouterFor<NotificationData> implements IObserver
{
   private _function: FunctionFor<NotificationData>;

   /**
    * Create empty NotificationRouterFor object
    */
   constructor();

   /**
    * Create a NotificationRouterFor object
    * @param interest_ - the thing it is interested in 
    */
   constructor(_function: FunctionFor<NotificationData>);

   /**
    * Create a NotificationRouterFor<NotificationData>  object
    * @param observerRouter - object to copy from - should work for JSON format and for real constructed objects
    */
   public constructor(observerRouter: NotificationRouterFor<NotificationData>);

   constructor(...arr: any[]) {
      if (arr.length === 0) { // Construct empty
         this._function = null;
         return;
      }
      else {
         if (this.isMyType (arr[0])) { // Copy constructor
            this._function = arr[0]._function;
         }
         else { // Individual arguments
            this._function = arr[0];
         }
      }
   }

   private isMyType(rhs: FunctionFor<NotificationData>): boolean {
      return rhs.hasOwnProperty('_function');
   }

   /**
   * set of 'getters' for private variables
   */
   get function(): FunctionFor<NotificationData> {
      return this._function;
   }

   /**
    * test for equality - checks all fields are the same. 
    * Shallow compare
    * @param rhs - the object to compare this one to.  
    */
   equals(rhs: NotificationRouterFor<NotificationData>): boolean {

      return (this._function === rhs._function);
   }

   /**
    * assignment operator 
    * @param rhs - the object to assign this one from.  
    */
   assign(rhs: NotificationRouterFor<NotificationData>): NotificationRouterFor<NotificationData> {
      this._function = rhs._function;

      return this;
   }

   notify(interest_: Interest, notification_: NotificationFor<NotificationData>): void {

      // pass on to the required method
      this._function(interest_, notification_);
   }
}

export interface IObserver {
   notify(interest_: Interest, notification_: Notification): void;
}

export interface INotifier {
   addObserver(observerInterest_: ObserverInterest): void;
   removeObserver(observerInterest_: ObserverInterest): boolean;
   removeAllObservers(): void;
}

/// <summary>
/// Notifier -  class that sends notifications when things change
/// </summary>
export class Notifier implements INotifier {

   private _observerInterests : Array<ObserverInterest>;

   /**
    * Create an empty Notifier object - required for particiation in serialisation framework
    */
   constructor() {
      this._observerInterests = new Array<ObserverInterest>();
   }

   // Operations
   notifyObservers(interest_: Interest, notificationData_: Notification): void {

      //log.debug(tag.notification, "Notification:" + interest_.notificationId + ": " + JSON.stringify (notificationData_));

      for (var i = 0; i < this._observerInterests.length; i++) {

         if (this._observerInterests[i].interest.equals (interest_)) {

            this._observerInterests[i].observer.notify(this._observerInterests[i].interest, notificationData_);
         }
       }
    }

   // Add the supplied observer to the list of observers associated with
   // the supplied interest. 
   addObserver(observerInterest_: ObserverInterest): void {

      const index = this._observerInterests.indexOf(observerInterest_);
      if (index === -1) {
         this._observerInterests.push(observerInterest_);
      }
   }

   // Remove the supplied observer from the list of observers associated
   // with the supplied interest.
   // returns TRUE if it was correctly found
   removeObserver(observerInterest_: ObserverInterest): boolean {

      const index = this._observerInterests.indexOf(observerInterest_);
      if (index > -1) {
         this._observerInterests.splice(index, 1);
         return true;
      }
      return false;
   }

   removeAllObservers(): void {
      this._observerInterests.length = 0
   }

};  //Notifier


