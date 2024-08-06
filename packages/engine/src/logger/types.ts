import {
  TAnyEntry,
  TDirPayload,
  TErrorPayload,
  TMessagePayload
} from './entry';
import { LogLevel } from './entry/types';

export type TTimeBreakpoint = {
  timeout: number;
  message: TMessagePayload;
  level: LogLevel;
};
export type TTimingBreakpoints = Record<string, TTimeBreakpoint>;

export interface ILogging {
  debug(message: TMessagePayload): void;
  info(message: TMessagePayload): void;
  log(message: TMessagePayload): void;
  warn(message: TMessagePayload): void;
  error(error: TErrorPayload): void;
  assert(assertion: boolean, message: TMessagePayload): void;

  dir(value: TDirPayload): void;

  time(label: string, breakpoints: TTimingBreakpoints): void;
  timeEnd(label: string): void;
}

export type TPushFn = (data: TAnyEntry | null) => void;
