export enum LogLevel {
  VERBOSE = 'VERBOSE',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export type TMessagePayload = string;
export type TDirPayload = object;
export type TErrorPayload = string | Error;
export type TTimingPayload = {
  label: string;
  timeStart: string;
  timeEnd: string;
};
