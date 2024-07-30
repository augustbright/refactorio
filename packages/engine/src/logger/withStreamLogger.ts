import { TWithStreamLogger } from './types';

import { Logger } from 'src/logger/Logger';

export const withStreamLogger = <
  CommonArgs extends Array<unknown>,
  OriginalResult
>(
  fn: (logger: Logger, ...args: CommonArgs) => OriginalResult
): ((...args: CommonArgs) => TWithStreamLogger<OriginalResult>) => {
  return (...args: CommonArgs) => {
    const logger = new Logger();

    const originalResult = fn(logger, ...args);

    Promise.resolve()
      .then(() => originalResult)
      .then(() => logger.end());

    return { output: logger.output, result: originalResult };
  };
};
