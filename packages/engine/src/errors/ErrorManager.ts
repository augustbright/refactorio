import { TLocation } from 'src/types';

class LocatedError<E extends Error> {
  constructor(
    public error: E,
    public loc: TLocation
  ) {}
}

export class ErrorManager {
  private constructor() {}
  static throw(error: Error, loc: TLocation): never {
    throw new LocatedError(error, loc);
  }
}
