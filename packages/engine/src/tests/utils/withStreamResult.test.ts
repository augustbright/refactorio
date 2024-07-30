import { sleep } from '../testUtils';

import { withStreamResult } from 'src/utils/withStreamResult';

describe('withStreamResult', () => {
  test('Wraps a function and returns result + stream', async () => {
    const original = jest.fn(async (out, a, b) => {
      out.push('message 1');
      await sleep(100);
      out.push('message 2');
      await sleep(100);
      out.push('message 3');
      return a + b;
    });

    const wrapped = withStreamResult(original);

    const { out, result } = wrapped(5, 7);
    const listener = jest.fn();
    out.on('data', listener);

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

    expect(out.closed).toBe(true);
  });
});
