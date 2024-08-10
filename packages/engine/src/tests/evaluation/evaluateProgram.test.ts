import { testIterate } from '../testUtils';
import { expectBreakpoint, expectNode } from '../testUtils/nodeMatchers';

import { getValue, isSuspended } from 'src/evaluation/evaluationContext';
import { EMPTY_LOCATION } from 'src/utils/location/emptyLocation';

describe('evaluateProgram', () => {
  test('empty program', () => {
    const { iterator } = testIterate.program``;
    expect(iterator.next()).toBeDone();
  });

  test('single statement', () => {
    const { iterator, print } = testIterate.program`print('Hello')`;
    expect(iterator.next()).toBeDone();
    expect(print).toHaveBeenCalledWith('Hello');
  });

  describe('breakpoints & debugging', () => {
    test('simple breakpoint', () => {
      const { iterator, context } = testIterate.program`BREAKPOINT`;
      expect(iterator.next()).toSuspendOn(expectBreakpoint());
      expect(isSuspended(context)).toBeTrue();
      expect(iterator.next('step')).toBeDone();
    });

    test('step over while debugging (simple case)', () => {
      const { iterator, context } = testIterate.program`
        SET value = 42
        BREAKPOINT
        value = 43
        value = 44`;

      expect(iterator.next()).toSuspendOn(expectBreakpoint());
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(42);
      expect(isSuspended(context)).toBeTrue();

      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(42);

      expect(iterator.next('step')).toSuspendOn(expectNode('Assignment'));
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(43);

      expect(iterator.next('step')).toBeDone();
    });

    test('step over while debugging (complex case)', () => {
      const { iterator, print } = testIterate.program`
        SET value1 = 10
        SET value2 = 20

        BREAKPOINT

        IF value1 > value2
          value1 = value1 + 100
          IF value1 > value2
            value2 = value2 + 100
          ELSE value1 = value1 + 100
        ELSE
          value2 = value2 + 100

        print(value1, value2)`;

      expect(iterator.next('step')).toSuspendOn(expectBreakpoint());
      expect(iterator.next('step')).toSuspendOn(expectNode('IfStatement'));
      expect(iterator.next('step')).toSuspendOn(expectNode('CallExpression'));
      expect(iterator.next('step')).toBeDone();
      expect(print).toHaveBeenCalledWith(10, 120);
    });
  });
});
