import { Readable } from 'stream';

import { TAnyEntry, TEntryFilter, TEntryType } from './entry';
import { LogLevel } from './entry/types';
import { TPushFn } from './types';

export class LoggerOutput {
  filtered(filter: TEntryFilter): Readable {
    const filteredStream = new Readable({
      objectMode: true,
      read() {}
    });

    this.baseStream.on('data', (entry: TAnyEntry) => {
      if (entry.matches(filter)) filteredStream.push(entry);
    });

    this.baseStream.on('end', () => {
      this.isEnded = true;
      filteredStream.push(null);
    });

    if (this.isEnded) {
      filteredStream.push(null);
    }

    return filteredStream;
  }

  constructor(pushReceiver: (push: TPushFn) => void) {
    pushReceiver(this.push.bind(this));
  }

  private push(entry: TAnyEntry | null) {
    this.baseStream.push(entry);

    if (entry !== null) {
      this.memory.push(entry);
      this.byLevel[entry.level].push(entry);
      this.byEntryType[entry.type].push(entry);
    }
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

  private isEnded = false;
  private baseStream = new Readable({
    objectMode: true,
    read: () => {}
  });
}

export const createLoggerOutput = () => {
  let pushToOutput: TPushFn = () => {};
  const output = new LoggerOutput((pushFn) => {
    pushToOutput = pushFn;
  });

  return {
    output,
    push: pushToOutput
  };
};
