import * as parser from 'recast/parsers/babel-ts.js';
import { connectable } from 'rxjs';

import { mockObserver, sleep, waitUntilComplete } from '../testUtils';

import { TAnyEntry } from 'src/logger/entry';
import { LogEntry } from 'src/logger/entry/implementations';
import { transformCode } from 'src/transformation';
import { TransformCodeResult } from 'src/transformation/transformCode';
import { filterLogs, filterResult, instancesOf } from 'src/utils/rx/operators';

describe('transformCode', () => {
  test('returns observable logs, result', async () => {
    const transformCode$ = connectable(
      transformCode({
        script: `
print('Hello world!')
print('How are you?')
`,
        code: `anyCode();`,
        globalContext: {},
        parser
      })
    );

    const logObserver = mockObserver<TAnyEntry>();
    const resultObserver = mockObserver<TransformCodeResult>();

    transformCode$.pipe(filterLogs()).subscribe(logObserver);
    transformCode$.pipe(filterResult()).subscribe(resultObserver);

    transformCode$.connect();

    await waitUntilComplete(resultObserver);

    expect(resultObserver).toReceive(
      new TransformCodeResult({ isChanged: false, code: 'anyCode();' })
    );

    expect(logObserver).toReceive(
      new LogEntry('Hello world!'),
      new LogEntry('How are you?')
    );
  });

  test('transforms the code using transformation script', async () => {
    const observer = mockObserver();
    transformCode({
      script: `
REPLACE Identifier[name == 'bad_name'] WITH b.identifier('good_name')
`,
      code: `const bad_name = 12;`,
      globalContext: {},
      parser
    })
      .pipe(instancesOf(TransformCodeResult))
      .subscribe(observer);
    sleep(1000);
    expect(observer.error).not.toHaveBeenCalled();
  });

  test('unhandled errors', () => {
    throw 'not implemented';
  });
});
