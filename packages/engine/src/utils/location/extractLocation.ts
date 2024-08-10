import { TLocation, TLocationExtract } from 'src/types';

export const extractLocation = (
  code: string,
  location: TLocation
): TLocationExtract => [
  code.substring(0, location.start),
  code.substring(location.start, location.end),
  code.substring(location.end)
];
