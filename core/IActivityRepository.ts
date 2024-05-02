// Copyright (c) 2024 Braid Technologies Ltd

// Internal import
import { ActivityRecord } from './ActivityRecord';
import { UrlActivityRecord } from './UrlActivityRecord';
import { MessageActivityRecord } from './MessageActivityRecord';

export interface IActivityRepository {

   save (record : ActivityRecord) : Promise<boolean>;
   loadRecentUrlActivity (count : number) : Promise<Array<ActivityRecord>>;
   loadRecentMessages (count : number) : Promise<Array<ActivityRecord>>;   
}


