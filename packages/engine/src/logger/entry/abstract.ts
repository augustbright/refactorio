import { LogLevel } from './types';

export abstract class AbstractLogEntry<Payload = unknown> {
  abstract type: string;
  abstract level: LogLevel;
  readonly timestamp: string;

  constructor(public readonly payload: Payload) {
    this.timestamp = new Date().toISOString();
  }
}
