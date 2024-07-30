import { sleep } from '../testUtils';

import { createLoggerOutput } from 'src/logger/LoggerOutput';
import {
  ErrorEntry,
  LogEntry,
  WarnEntry
} from 'src/logger/entry/implementations';

describe('LoggerOutput', () => {
  test('streams filtered data', async () => {
    const { output, push } = createLoggerOutput();

    const handleAllData = jest.fn();
    const handleErrorData = jest.fn();
    const handleErrorAndWarnData = jest.fn();

    output.filtered({}).on('data', handleAllData);
    output
      .filtered({
        type: 'ERROR'
      })
      .on('data', handleErrorData);
    output
      .filtered({
        type: ['ERROR', 'WARN']
      })
      .on('data', handleErrorAndWarnData);

    push(new LogEntry('hello'));
    push(new ErrorEntry('error occured'));
    push(new WarnEntry('some warning'));
    await sleep(10);

    expect(handleErrorData).toHaveBeenCalledTimes(1);
    expect(handleErrorAndWarnData).toHaveBeenCalledTimes(2);
    expect(handleAllData).toHaveBeenCalledTimes(3);
  });
  test("Entry instances are passed to 'data' event handlers", async () => {
    const { output, push } = createLoggerOutput();

    const handleAllData = jest.fn();

    output.filtered({}).on('data', handleAllData);

    push(new LogEntry('hello'));
    push(new ErrorEntry('error occured'));
    push(new WarnEntry('some warning'));

    await sleep(10);

    expect(handleAllData.mock.calls[0][0]).toBeInstanceOf(LogEntry);
    expect(handleAllData.mock.calls[1][0]).toBeInstanceOf(ErrorEntry);
    expect(handleAllData.mock.calls[2][0]).toBeInstanceOf(WarnEntry);
  });
});
