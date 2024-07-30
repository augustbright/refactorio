import { Readable, Stream } from 'stream';

import { TWithStream } from '../transformation/types';

export const withStreamResult = <
  CommonArgs extends Array<unknown>,
  OriginalResult
>(
  fn: (out: Readable, ...args: CommonArgs) => OriginalResult
): ((...args: CommonArgs) => TWithStream<OriginalResult>) => {
  return (...args: CommonArgs) => {
    const out = new Stream.Readable({
      read: () => {}
    });

    const originalResult = fn(out, ...args);

    Promise.resolve()
      .then(() => originalResult)
      .then(() => out.push(null));

    return { out, result: originalResult };
  };
};
