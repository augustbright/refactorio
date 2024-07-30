import { LoggerOutput, createLoggerOutput } from './LoggerOutput';
import {
  TAnyEntry,
  TDirPayload,
  TEntryType,
  TErrorPayload,
  TMessagePayload
} from './entry';
import {
  AssertionEntry,
  DebugEntry,
  DirEntry,
  ErrorEntry,
  InfoEntry,
  LogEntry,
  WarnEntry
} from './entry/implementations';
import { LogLevel } from './entry/types';
import { ILogging, TPushFn, TTimingBreakpoints } from './types';

export class Logger implements ILogging {
  readonly output: LoggerOutput;
  private push: TPushFn;

  constructor() {
    const { output, push } = createLoggerOutput();
    this.push = push;
    this.output = output;
  }

  debug(message: TMessagePayload): void {
    this.put(new DebugEntry(message));
  }

  info(message: TMessagePayload): void {
    this.put(new InfoEntry(message));
  }

  log(message: TMessagePayload): void {
    this.put(new LogEntry(message));
  }

  warn(message: TMessagePayload): void {
    this.put(new WarnEntry(message));
  }

  error(error: TErrorPayload): void {
    this.put(new ErrorEntry(error));
  }

  assert(assertion: boolean, message: TMessagePayload): void {
    if (!assertion) {
      this.put(new AssertionEntry(message));
    }
  }

  dir(value: TDirPayload): void {
    this.put(new DirEntry(value));
  }

  time(label: string, breakpoints: TTimingBreakpoints): void {
    this.startTime(label, breakpoints);
  }

  timeEnd(label: string): void {
    this.finishTime(label);
  }

  private readonly memory: TAnyEntry[] = [];
  private readonly byLevel: Record<LogLevel, TAnyEntry[]> = {
    [LogLevel.VERBOSE]: [],
    [LogLevel.INFO]: [],
    [LogLevel.WARNING]: [],
    [LogLevel.ERROR]: []
  };
  private readonly byEntryType: Record<TEntryType, TAnyEntry[]> = {
    DEBUG: [],
    INFO: [],
    LOG: [],
    WARN: [],
    ERROR: [],
    ASSERTION: [],
    DIR: [],
    TIME_END: []
  };

  private put(entry: TAnyEntry): void {
    this.memory.push(entry);
    this.byLevel[entry.level].push(entry);
    this.byEntryType[entry.type].push(entry);

    this.push(entry);
  }

  private startTime(label: string, breakpoints: TTimingBreakpoints): void {
    label;
    breakpoints;
  }

  private finishTime(label: string): void {
    label;
  }
}
