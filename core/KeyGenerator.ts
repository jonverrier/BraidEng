// Copyright (c) 2023 TXPCo Ltd

/// <summary>
/// IKeyGenerator - interface for a class to generate unique keys
/// </summary>
export interface IKeyGenerator {

   generateKey (): string;
   couldBeAKey(key: string): boolean;
}