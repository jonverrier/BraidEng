'use strict';
// Copyright TXPCo ltd, 2021
import { expect } from 'expect';
import { describe, it } from 'mocha';

import { uuid, looksLikeUuid} from '../core/Uuid';

const badUuid = "9a0583f5xca56-421b-8545-aa23032d6c93"


describe("Uuid", function () {

   it("Needs to create UUID", function () {

      var newUuid: string = uuid();
      expect(newUuid.length == 36).toEqual(true);
   });

   it("Needs to test valid UUID", function () {

      var newUuid: string = uuid();
      expect(looksLikeUuid(newUuid)).toEqual(true);

      expect(looksLikeUuid("")).toEqual(false);
      expect(looksLikeUuid(badUuid)).toEqual(false);
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

      var newUuid: string = uuid();

      expect(newUuid.length == 36).toEqual(true);
   });

   it("Needs to test valid UUID without Blob", function () {

      var newUuid: string = uuid();
      expect(looksLikeUuid(newUuid)).toEqual(true);

      expect(looksLikeUuid("")).toEqual(false);
      expect(looksLikeUuid(badUuid)).toEqual(false);
   });
});