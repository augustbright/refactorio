import { stringify } from 'safe-stable-stringify';

import { TEntryFilter } from '.';
import { LogEntryJSON } from './serialization';
import { LogLevel } from './types';

export abstract class AbstractLogEntry<Payload> {
  abstract type: string;
  abstract level: LogLevel;
  readonly timestamp: string;
  readonly payload: Payload;

  constructor(payload: Payload) {
    this.timestamp = new Date().toISOString();
    this.payload = payload;
  }

  matches(filter: TEntryFilter) {
    return (['level', 'type'] as const).every((filterKey) => {
      if (!(filterKey in filter)) return true;
      return [filter[filterKey]]
        .flat()
        .some((keyValue) => this[filterKey] === keyValue);
    });
  }

  get serialized() {
    return stringify({
      type: this.type,
      level: this.level,
      timestamp: this.timestamp,
      payload: this.payload
    }) as string;
  }

  static parse(serialized: string) {
    return JSON.parse(serialized) as LogEntryJSON;
  }
}
