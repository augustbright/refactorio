import { Readable } from 'stream';

import { TWithStreamLogger } from './types';

import { Logger } from 'src/logger/Logger';

export const withStreamLogger = <
  CommonArgs extends Array<unknown>,
  OriginalResult
>(
  fn: (logger: Readable, ...args: CommonArgs) => OriginalResult
): ((...args: CommonArgs) => TWithStreamLogger<OriginalResult>) => {
  return (...args: CommonArgs) => {
    const logger = new Logger();

    const originalResult = fn(logger, ...args);

    Promise.resolve()
      .then(() => originalResult)
      .then(() => logger.push(null));

    return { logger, result: originalResult };
  };
};
