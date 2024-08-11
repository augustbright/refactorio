import { TMessagePayload } from './entry';
import { LogLevel } from './entry/types';

export type TTimeBreakpoint = {
  timeout: number;
  message: TMessagePayload;
  level: LogLevel;
};
export type TTimingBreakpoints = Record<string, TTimeBreakpoint>;
