import * as implementations from './implementations';
import { LogLevel } from './types';

export type TAnyEntry = InstanceType<
  (typeof implementations)[keyof typeof implementations]
>;

export { TMessagePayload, TDirPayload, TErrorPayload } from './types';

export type TEntryType = TAnyEntry['type'];

const MAP_TYPE_TO_CLASS = {
  DEBUG: implementations.DebugEntry,
  INFO: implementations.InfoEntry,
  LOG: implementations.LogEntry,
  WARN: implementations.WarnEntry,
  ERROR: implementations.ErrorEntry,
  DIR: implementations.DirEntry,
  ASSERTION: implementations.AssertionEntry,
  TIME_END: implementations.TimeEndEntry
} as const;

// If typescript throws an error here, it possibly means that some type is missing in MAP_TYPE_TO_CLASS abobe
export type TEntryByType<TYPE extends TEntryType> = InstanceType<
  (typeof MAP_TYPE_TO_CLASS)[TYPE]
>;

export type TEntryFilter = {
  level?: LogLevel | LogLevel[];
  type?: TEntryType | TEntryType[];
};
