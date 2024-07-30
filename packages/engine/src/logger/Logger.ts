import { LoggerOutput, createLoggerOutput } from './LoggerOutput';
import { TDirPayload, TErrorPayload, TMessagePayload } from './entry';
import {
  AssertionEntry,
  DebugEntry,
  DirEntry,
  ErrorEntry,
  InfoEntry,
  LogEntry,
  WarnEntry
} from './entry/implementations';
import { ILogging, TPushFn, TTimingBreakpoints } from './types';

export class Logger implements ILogging {
  readonly output: LoggerOutput;
  push: TPushFn;

  constructor() {
    const { output, push } = createLoggerOutput();
    this.push = push;
    this.output = output;
  }

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

  end() {
    this.push(null);
  }

  private startTime(label: string, breakpoints: TTimingBreakpoints): void {
    label;
    breakpoints;
  }

  private finishTime(label: string): void {
    label;
  }
}
