import { TEntryByType, TEntryType } from '.';

export type LogEntryJSON<T extends TEntryType = TEntryType> = {
  type: T;
  level: TEntryByType<T>['level'];
  timestamp: string;
  payload: TEntryByType<T>['payload'];
};
