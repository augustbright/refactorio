import { Readable } from 'stream';

import { TAnyEntry, TEntryFilter } from './entry';
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

  private push(data: TAnyEntry | null) {
    this.baseStream.push(data);
  }
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
