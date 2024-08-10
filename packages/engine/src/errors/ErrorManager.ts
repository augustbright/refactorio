import { LocatedError } from './LocatedError';

import { TLocation } from 'src/types';

export class ErrorManager {
  private constructor() {}
  static throw(error: Error, loc: TLocation): never {
    throw new LocatedError(error, loc);
  }
}
