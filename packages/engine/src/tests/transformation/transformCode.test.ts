import * as parser from 'recast/parsers/babel-ts.js';
import { connectable, filter } from 'rxjs';

import { mockObserver, sleep } from '../testUtils';

import { AbstractLogEntry } from 'src/logger/entry/abstract';
import { transformCode } from 'src/transformation';
import { TransformCodeResult } from 'src/transformation/transformCode';
import { instancesOf } from 'src/utils/rx/takeResults';

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

    const logObserver = mockObserver();
    const resultObserver = mockObserver();

    transformCode$
      .pipe(filter((entry) => entry instanceof AbstractLogEntry))
      .subscribe(logObserver);
    transformCode$
      .pipe(filter((entry) => entry instanceof TransformCodeResult))
      .subscribe(resultObserver);

    transformCode$.connect();

    await sleep(300);

    expect(resultObserver.next).toHaveBeenCalledOnce();
    expect(resultObserver.next.mock.calls[0][0]).toBeInstanceOf(
      TransformCodeResult
    );

    expect(resultObserver.next.mock.calls[0][0].data).toEqual({
      isChanged: false,
      code: 'anyCode();'
    });
    expect(resultObserver.next.mock.calls[0][0].data.isChanged).toBeFalse();
    expect(resultObserver.next.mock.calls[0][0].data.code).toBe(`anyCode();`);

    expect(logObserver.next).toHaveBeenCalledTimes(2);
    expect(logObserver.next.mock.calls[0][0]).toBeInstanceOf(AbstractLogEntry);
    expect(logObserver.next.mock.calls[0][0].payload).toBe('Hello world!');

    expect(logObserver.next.mock.calls[1][0]).toBeInstanceOf(AbstractLogEntry);
    expect(logObserver.next.mock.calls[1][0].payload).toBe('How are you?');
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
