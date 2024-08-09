import { TLocation } from 'src/types';

export const EMPTY_LOCATION: TLocation = {
  start: 0,
  end: 0,
  line: 0,
  column: 0
};
Object.freeze(EMPTY_LOCATION);
