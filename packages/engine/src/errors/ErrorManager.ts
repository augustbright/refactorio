import { LocatedError } from './LocatedError';

import { TLocation } from 'src/types';

export const ErrorManager = {
  throw(error: Error, loc: TLocation): never {
    throw new LocatedError(error, loc);
  }
};
