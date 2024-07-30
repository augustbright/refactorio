import { sleep } from '../testUtils';

import { withStreamLogger } from 'src/logger/withStreamLogger';

describe('withStreamLogger', () => {
  test('Wraps a function and returns result + stream', async () => {
    const original = jest.fn(async (out, a, b) => {
      out.push('message 1');
      await sleep(100);
      out.push('message 2');
      await sleep(100);
      out.push('message 3');
      return a + b;
    });

    const wrapped = withStreamLogger(original);

    const { logger, result } = wrapped(5, 7);
    const listener = jest.fn();
    logger.on('data', listener);

    await sleep(10);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0].toString()).toBe('message 1');

    await sleep(100);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[1].toString()).toBe('message 2');

    await expect(result).resolves.toBe(12);

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener.mock.calls[2].toString()).toBe('message 3');

    await sleep(10);

    expect(logger.closed).toBe(true);
  });

  test("stream keeps data until is's read", async () => {
    const original = jest.fn(async (out, a, b) => {
      out.push('message 1');
      await sleep(100);
      out.push('message 2');
      await sleep(100);
      out.push('message 3');
      return a + b;
    });

    const wrapped = withStreamLogger(original);

    const { logger, result } = wrapped(5, 7);

    await sleep(300);

    await expect(result).resolves.toBe(12);

    await sleep(10);

    expect(logger.closed).toBe(false);

    const listener = jest.fn();
    logger.on('data', listener);

    await sleep(10);

    expect(listener).toHaveBeenCalledTimes(3);

    expect(logger.closed).toBe(true);
  });
});
