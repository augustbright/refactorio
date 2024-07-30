import { sleep } from '../testUtils';

import { Logger } from 'src/logger/Logger';
import { withStreamLogger } from 'src/logger/withStreamLogger';

describe('withStreamLogger', () => {
  test('Wraps a function and returns result + stream', async () => {
    const original = jest.fn(async (logger: Logger, a, b) => {
      logger.log('message 1');
      await sleep(100);
      logger.log('message 2');
      await sleep(100);
      logger.log('message 3');
      return a + b;
    });

    const wrapped = withStreamLogger(original);

    const { output, result } = wrapped(5, 7);
    const listener = jest.fn();
    const all = output.filtered({});
    all.on('data', listener);

    await sleep(10);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].payload).toBe('message 1');

    await sleep(100);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[1][0].payload).toBe('message 2');

    await expect(result).resolves.toBe(12);

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener.mock.calls[2][0].payload).toBe('message 3');

    await sleep(10);

    expect(all.closed).toBe(true);
  });

  test("stream keeps data until is's read", async () => {
    const original = jest.fn(async (logger, a, b) => {
      logger.log('message 1');
      await sleep(100);
      logger.log('message 2');
      await sleep(100);
      logger.log('message 3');
      return a + b;
    });

    const wrapped = withStreamLogger(original);

    const { output, result } = wrapped(5, 7);
    const all = output.filtered({});

    await sleep(300);

    await expect(result).resolves.toBe(12);

    await sleep(10);

    expect(all.closed).toBe(false);

    const listener = jest.fn();
    all.on('data', listener);

    await sleep(10);

    expect(listener).toHaveBeenCalledTimes(3);

    expect(all.closed).toBe(true);
  });
});
