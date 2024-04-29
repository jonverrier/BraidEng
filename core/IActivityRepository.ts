// Copyright (c) 2024 Braid Technologies Ltd

// Internal import
import { ActivityRecord } from './ActivityRecord';

export interface IActivityRepository {

   save (record : ActivityRecord) : Promise<boolean>;
   loadRecent (count : number) : Promise<Array<ActivityRecord>>;
}


