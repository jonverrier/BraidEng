// Copyright (c) 2024 Braid Technologies Ltd

/// <summary>
/// IKeyGenerator - interface for a class to generate unique keys
/// </summary>
export interface IKeyGenerator {

   generateKey (): string;
   couldBeAKey(key: string): boolean;
}