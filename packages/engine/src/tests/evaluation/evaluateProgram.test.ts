import { testIterate } from '../testUtils';
import { expectBreakpoint, expectNode } from '../testUtils/nodeMatchers';

import {
  getValue,
  isSuspended,
  setDebugging
} from 'src/evaluation/evaluationContext';
import { EMPTY_LOCATION } from 'src/utils/location/emptyLocation';

const SAMPLE_CODE = `
SET value1 = 10
SET value2 = 20
SET value3 = 0

BREAKPOINT

IF value1 < value2
  value1 = value1 + 100
  IF value1 > value2
    value2 = value2 + 100
    value2 = value2 + 100
    value2 = value2 + 100
    IF value2 > value1
      value1 = value1 + 100
      value1 = value1 + 100
      value1 = value1 + 100
    value3 = value3 + 1
    value3 = value3 + 1
  ELSE value1 = value1 + 100
  value3 = value3 + 1
  value3 = value3 + 1
ELSE
  value2 = value2 + 100

print(value1, value2)
`;

describe('evaluateProgram', () => {
  test('empty program', () => {
    const { iterator } = testIterate.program``;
    expect(iterator.next('run')).toBeDone();
  });

  test('single statement', () => {
    const { iterator, print } = testIterate.program`print('Hello')`;
    expect(iterator.next('run')).toBeDone();
    expect(print).toHaveBeenCalledWith('Hello');
  });

  test('multiple statements', () => {
    const { iterator, context, print } = testIterate.program`${SAMPLE_CODE}`;
    setDebugging(context, false);
    expect(iterator.next('run')).toBeDone();
    expect(print).toHaveBeenCalledWith(410, 320);
  });

  describe('breakpoints & debugging', () => {
    test('simple breakpoint', () => {
      const { iterator, context } = testIterate.program`BREAKPOINT`;
      expect(iterator.next('run')).toSuspendOn(expectBreakpoint());
      expect(isSuspended(context)).toBeTrue();
      expect(iterator.next('step')).toBeDone();
    });

    test('step over while debugging (simple case)', () => {
      const { iterator, context } = testIterate.program`
        SET value = 42
        BREAKPOINT
        value = 43
        value = 44`;

      expect(iterator.next('run')).toSuspendOn(expectBreakpoint());
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(42);
      expect(isSuspended(context)).toBeTrue();

      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(42);

      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(43);

      expect(iterator.next('step')).toBeDone();
    });

    test('step over while debugging', () => {
      const { iterator, print } = testIterate.program`${SAMPLE_CODE}`;

      expect(iterator.next('run')).toSuspendOn(expectBreakpoint());
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step')).toSuspendOn(expectNode('CallExpression'));
      expect(iterator.next('step')).toBeDone();
      expect(print).toHaveBeenCalledWith(410, 320);
    });
    test('step in while debugging', () => {
      const { iterator, print } = testIterate.program`${SAMPLE_CODE}`;

      expect(iterator.next('run')).toSuspendOn(expectBreakpoint());
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));

      expect(iterator.next('step')).toSuspendOn(
        expectNode('Assignment', { name: 'value3' })
      );
      expect(iterator.next('step')).toSuspendOn(
        expectNode('Assignment', { name: 'value3' })
      );

      expect(iterator.next('step')).toSuspendOn(
        expectNode('Assignment', { name: 'value3' })
      );
      expect(iterator.next('step')).toSuspendOn(
        expectNode('Assignment', { name: 'value3' })
      );

      expect(iterator.next('step')).toSuspendOn(expectNode('CallExpression'));
      expect(iterator.next('step')).toBeDone();
      expect(print).toHaveBeenCalledWith(410, 320);
    });
    test('step out while debugging', () => {
      const { iterator, print } = testIterate.program`${SAMPLE_CODE}`;

      expect(iterator.next('run')).toSuspendOn(expectBreakpoint());
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step out')).toSuspendOn(
        expectNode('Assignment', { name: 'value3' })
      );
      expect(iterator.next('step out')).toSuspendOn(
        expectNode('Assignment', { name: 'value3' })
      );
      expect(iterator.next('step')).toSuspendOn(
        expectNode('Assignment', { name: 'value3' })
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('CallExpression'));
      expect(iterator.next('step')).toBeDone();
      expect(print).toHaveBeenCalledWith(410, 320);
    });
    test('run while debugging', () => {
      const { iterator, print } = testIterate.program`${SAMPLE_CODE}`;

      expect(iterator.next('run')).toSuspendOn(expectBreakpoint());
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step into')).toSuspendOn(
        expectNode('BinaryExpression')
      );
      expect(iterator.next('step')).toSuspendOn(expectNode('Block'));
      expect(iterator.next('step into')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(iterator.next('run')).toBeDone();
      expect(print).toHaveBeenCalledWith(410, 320);
    });
  });
});
