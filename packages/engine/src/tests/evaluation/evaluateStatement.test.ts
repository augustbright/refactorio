import { testIterate } from '../testUtils';

import { getOwnValue, hasOwnValue } from 'src/evaluation/evaluationContext';
import { EMPTY_LOCATION } from 'src/utils/location/emptyLocation';

describe('evaluateStatement', () => {
  describe('expressions as statements', () => {
    test('literal', () => {
      const { iterator } = testIterate.statement`42`;
      expect(iterator.next()).toBeDone().toHaveValue(42);
    });
    test('identifier', () => {
      const { iterator, context } = testIterate.statement`foo`;
      context.foo = 42;
      expect(iterator.next()).toBeDone().toHaveValue(42);
    });
    test('binary expression', () => {
      const { iterator, context } = testIterate.statement`foo + bar`;
      context.foo = 10;
      context.bar = 40;

      expect(iterator.next()).toBeDone().toHaveValue(50);
    });
    test('member expression', () => {
      const { iterator, context } = testIterate.statement`foo.bar`;
      context.foo = { bar: 42 };
      expect(iterator.next()).toBeDone().toHaveValue(42);
    });
    test('call expression', () => {
      const { iterator, context } = testIterate.statement`foo(1, 2)`;
      context.foo = (a: number, b: number) => a + b;

      expect(iterator.next()).toBeDone().toHaveValue(3);
    });
    test('object literal', () => {
      const { iterator } = testIterate.statement`{ foo: 42 }`;
      expect(iterator.next()).toBeDone().toHaveValue({ foo: 42 });
    });
  });

  describe('if statement', () => {
    test('If statement', () => {
      const { iterator } = testIterate.statement`IF 1 + 1 42`;
      expect(iterator.next()).toEqual({
        value: 42,
        done: true
      });
    });

    test('If statement with else', () => {
      const { iterator } = testIterate.statement`IF 1 - 1 42 ELSE 8`;
      expect(iterator.next()).toEqual({
        value: 8,
        done: true
      });
    });

    test('If statement with else if', () => {
      const { iterator } = testIterate.statement`IF 1 - 1 42 ELSE IF 1 + 1 8`;
      expect(iterator.next()).toEqual({
        value: 8,
        done: true
      });
    });

    test('If statement with else if and else', () => {
      const { iterator } =
        testIterate.statement`IF 1 - 1 42 ELSE IF 1 - 1 8 ELSE 4`;
      expect(iterator.next()).toEqual({
        value: 4,
        done: true
      });
    });

    test('If statement with else if and else if', () => {
      const { iterator } =
        testIterate.statement`IF 1 - 1 42 ELSE IF 1 - 1 8 ELSE IF 1 + 1 4`;
      expect(iterator.next()).toEqual({
        value: 4,
        done: true
      });
    });

    test('If statement with else if and else if and else', () => {
      const { iterator } =
        testIterate.statement`IF 1 - 1 42 ELSE IF 1 - 1 8 ELSE IF 1 - 1 4 ELSE 2`;
      expect(iterator.next()).toEqual({
        value: 2,
        done: true
      });
    });
  });

  describe('block statement', () => {
    // Block statement is created using indentation like in Python
    test('Block statement', () => {
      const { iterator, context } = testIterate.statement`
        IF TRUE
          SET foo = 42
          SET bar = 8
          result = foo + bar`;

      context.result = 0;
      expect(iterator.next()).toEqual({
        value: undefined,
        done: true
      });
      expect(hasOwnValue(context, 'foo')).toBeFalse();
      expect(hasOwnValue(context, 'bar')).toBeFalse();
      expect(getOwnValue(context, 'result', EMPTY_LOCATION)).toBe(50);
    });

    // Block statement can be nested, creating a new context for each block
    test.skip('Block statement with broken indentation', () => {
      const { iterator } = testIterate.statement`
        SET foo = 42
            SET bar = 8`;
      expect(() => iterator.next()).toThrow(`Broken indentation`);
    });
  });
});
