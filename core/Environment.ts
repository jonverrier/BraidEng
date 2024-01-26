// Copyright (c) 2024 Braid Technologies Ltd

export enum EEnvironment {

   kLocal = "Local", 
   kStaging = "Staging", 
   kProduction = "Production"
   
};

let environment = EEnvironment.kProduction;


export class Environment {

   // returns the environment type.
   // code lines are different for each environment
   environment  () : EEnvironment {
      return environment;
   }

}