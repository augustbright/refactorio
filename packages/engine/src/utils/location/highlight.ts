import { TLocationExtract } from 'src/types';

export const highlight = (locationExtract: TLocationExtract): string =>
  [
    locationExtract[0],
    // yellow bg
    '\x1b[43m',
    locationExtract[1],
    // reset bg
    '\x1b[49m',

    locationExtract[2]
  ].join('');
