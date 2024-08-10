import { TLocation } from 'src/types';

export class LocatedError<E extends Error> {
  constructor(
    public error: E,
    public loc: TLocation
  ) {}

  toString() {
    return `${this.error.message} at ${this.loc.line}:${this.loc.column}`;
  }

  toJSON() {
    return `${this.error.message} at ${this.loc.line}:${this.loc.column}`;
  }
}
