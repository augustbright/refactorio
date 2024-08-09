import { testContext, testIterate } from '../testUtils';

import {
  getValue,
  isSuspended,
  setDebugging
} from 'src/evaluation/evaluationContext';
import { EMPTY_LOCATION } from 'src/utils/emptyLocation';

// evaluation programs always return undefined

describe('evaluateProgram', () => {
  test('empty program', () => {
    const iterator = testIterate.program(testContext({}), '');
    expect(iterator.next()).toEqual({
      value: undefined,
      done: true
    });
  });

  test('single statement', () => {
    const iterator = testIterate.program(testContext({}), '42');
    expect(iterator.next()).toEqual({
      value: undefined,
      done: true
    });
  });

  test('multiple statements', () => {
    const iterator = testIterate.program(testContext({}), '42\n8');
    expect(iterator.next()).toEqual({
      value: undefined,
      done: true
    });
  });

  describe('breakpoints & debugging', () => {
    // "BREAKPOINT" statement suspends the evaluation
    // Block statement is created using indentation like in Python
    test('simple breakpoint', () => {
      const context = testContext({});
      setDebugging(context, true);
      const iterator = testIterate.program(context, 'BREAKPOINT');
      expect(iterator.next()).toMatchObject({
        value: {
          step: true
        },
        done: false
      });
      expect(isSuspended(context)).toBeTrue();
      expect(iterator.next()).toMatchObject({
        value: undefined,
        done: true
      });
    });

    test('step over while debugging (simple case)', () => {
      const context = testContext({});
      setDebugging(context, true);
      const iterator = testIterate.program(
        context,
        'SET value = 42\nBREAKPOINT\nvalue = 43\nvalue = 44'
      );
      expect(iterator.next()).toMatchObject({
        value: {
          step: true
        },
        done: false
      });
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(42);
      expect(isSuspended(context)).toBeTrue();

      expect(iterator.next('step')).toMatchObject({
        value: {
          step: true
        },
        done: false
      });
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(42);
      expect(iterator.next('step')).toMatchObject({
        value: {
          step: true
        },
        done: false
      });
      expect(getValue(context, 'value', EMPTY_LOCATION)).toBe(43);
      expect(iterator.next('step')).toMatchObject({
        value: undefined,
        done: true
      });
    });

    test('step over while debugging (complex case)', () => {
      const print = jest.fn();
      const context = testContext({
        print: {
          value: print
        }
      });
      setDebugging(context, true);
      const iterator = testIterate.program(
        context,
        `
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
        
        print(value1, value2)
        `
      );

      expect(iterator.next()).toMatchObject({});
    });
  });
});
