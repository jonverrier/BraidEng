'use strict';
// Copyright Braid technologies ltd, 2024
import { expect } from 'expect';
import { describe, it } from 'mocha';
import { IKeyGenerator } from '../core/KeyGenerator';
import { UuidKeyGenerator } from '../core/UuidKeyGenerator';

const badUuid = "9a0583f5xca56-421b-8545-aa23032d6c93"

var keyGenerator: IKeyGenerator = new UuidKeyGenerator();

describe("Uuid", function () {

   it("Needs to create UUID", function () {

      var newUuid: string = keyGenerator.generateKey();
      expect(newUuid.length == 36).toEqual(true);
   });

   it("Needs to test valid UUID", function () {

      var newUuid: string = keyGenerator.generateKey();
      expect(keyGenerator.couldBeAKey(newUuid)).toEqual(true);

      expect(keyGenerator.couldBeAKey("")).toEqual(false);
      expect(keyGenerator.couldBeAKey(badUuid)).toEqual(false);
   });   
});

describe("Uuid - without Blob", function () {

   var oldBlob: any = global.Blob;

   beforeEach(() => {
      (global.Blob as any) = undefined;
   });

   afterEach(() => {
      (global.Blob as any) = oldBlob;
   });

   it("Needs to create UUID without Blob", function () {

      var newUuid: string = keyGenerator.generateKey();

      expect(newUuid.length == 36).toEqual(true);
   });

   it("Needs to test valid UUID without Blob", function () {

      var newUuid: string = keyGenerator.generateKey();
      expect(keyGenerator.couldBeAKey(newUuid)).toEqual(true);

      expect(keyGenerator.couldBeAKey("")).toEqual(false);
      expect(keyGenerator.couldBeAKey(badUuid)).toEqual(false);
   });
});