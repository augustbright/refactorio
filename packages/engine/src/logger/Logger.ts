import { TDirPayload, TErrorPayload, TMessagePayload } from './entry';
import { AbstractLogEntry } from './entry/abstract';
import {
  AssertionEntry,
  DebugEntry,
  DirEntry,
  ErrorEntry,
  InfoEntry,
  LogEntry,
  WarnEntry
} from './entry/implementations';
import { TTimingBreakpoints } from './types';

export class Logger {
  debug(message: TMessagePayload): void {
    this.push(new DebugEntry(message));
  }

  info(message: TMessagePayload): void {
    this.push(new InfoEntry(message));
  }

  log(message: TMessagePayload): void {
    this.push(new LogEntry(message));
  }

  warn(message: TMessagePayload): void {
    this.push(new WarnEntry(message));
  }

  error(error: TErrorPayload): void {
    this.push(new ErrorEntry(error));
  }

  assert(assertion: boolean, message: TMessagePayload): void {
    if (!assertion) {
      this.push(new AssertionEntry(message));
    }
  }

  dir(value: TDirPayload): void {
    this.push(new DirEntry(value));
  }

  time(label: string, breakpoints: TTimingBreakpoints): void {
    this.startTime(label, breakpoints);
  }

  timeEnd(label: string): void {
    this.finishTime(label);
  }

  private push(_entry: AbstractLogEntry): void {
    // TODO implement
  }

  private startTime(label: string, breakpoints: TTimingBreakpoints): void {
    label;
    breakpoints;
  }

  private finishTime(label: string): void {
    label;
  }
}
