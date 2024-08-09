import { testContext, testIterate } from '../testUtils';

import { getOwnValue, hasOwnValue } from 'src/evaluation/evaluationContext';
import { EMPTY_LOCATION } from 'src/utils/emptyLocation';

describe('evaluateStatement', () => {
  describe('expressions as statements', () => {
    test('Object literal', () => {
      const iterator = testIterate.statement(testContext({}), '{ foo: 42 }');
      expect(iterator.next()).toEqual({
        value: { foo: 42 },
        done: true
      });
    });
    test('Binary expression', () => {
      const iterator = testIterate.statement(testContext({}), '42 + 8');
      expect(iterator.next()).toEqual({
        value: 50,
        done: true
      });
    });
    test('Identifier', () => {
      const iterator = testIterate.statement(
        testContext({ foo: { value: 42 } }),
        'foo'
      );
      expect(iterator.next()).toEqual({
        value: 42,
        done: true
      });
    });
    test('Literal', () => {
      const iterator = testIterate.statement(testContext({}), '42');
      expect(iterator.next()).toEqual({
        value: 42,
        done: true
      });
    });
    test('Member expression', () => {
      const iterator = testIterate.statement(
        testContext({
          foo: {
            value: {
              bar: 42
            }
          }
        }),
        'foo.bar'
      );
      expect(iterator.next()).toEqual({
        value: 42,
        done: true
      });
    });
    test('Call expression', () => {
      const iterator = testIterate.statement(
        testContext({
          foo: {
            value: (a: number, b: number) => a + b
          }
        }),
        'foo(1, 2)'
      );
      expect(iterator.next()).toEqual({
        value: 3,
        done: true
      });
    });
  });

  describe('variable declaration and assignment', () => {
    test('Variable declaration', () => {
      const context = testContext({});
      const iterator = testIterate.statement(context, 'SET foo = 42');
      expect(iterator.next()).toEqual({
        value: undefined,
        done: true
      });
      expect(getOwnValue(context, 'foo', EMPTY_LOCATION)).toBe(42);
    });

    test('Variable assignment', () => {
      const context = testContext({ foo: { value: 42, writable: true } });
      const iterator = testIterate.statement(context, 'foo = 8');
      expect(iterator.next()).toEqual({
        value: 8,
        done: true
      });
      expect(getOwnValue(context, 'foo', EMPTY_LOCATION)).toBe(8);
    });

    test('Chained variable assignment', () => {
      const context = testContext({
        foo: { value: 42, writable: true },
        bar: { value: 8, writable: true }
      });
      const iterator = testIterate.statement(context, 'foo = bar = 8');
      expect(iterator.next()).toEqual({
        value: 8,
        done: true
      });
      expect(getOwnValue(context, 'foo', EMPTY_LOCATION)).toBe(8);
      expect(getOwnValue(context, 'bar', EMPTY_LOCATION)).toBe(8);
    });

    test('Variable assignment to undeclared identifier', () => {
      const iterator = testIterate.statement(testContext({}), 'foo = 8');
      expect(() => iterator.next()).toThrow(`'foo' is not defined`);
    });

    test('Variable assignment to read-only identifier', () => {
      const context = testContext({ foo: { value: 42 } });
      const iterator = testIterate.statement(context, 'foo = 8');
      expect(() => iterator.next()).toThrow(`Identifier 'foo' is read-only`);
    });

    test('Variable assignment to non-writable identifier', () => {
      const context = testContext({ foo: { value: 42, writable: false } });
      const iterator = testIterate.statement(context, 'foo = 8');
      expect(() => iterator.next()).toThrow(`Identifier 'foo' is read-only`);
    });

    test('Variable assignment to sealed context', () => {
      const context = testContext({});
      Object.seal(context);
      const iterator = testIterate.statement(context, 'foo = 8');
      expect(() => iterator.next()).toThrow(
        `Current context is forbidden to modify`
      );
    });

    test('Variable assignment to frozen context', () => {
      const context = testContext({});
      Object.freeze(context);
      const iterator = testIterate.statement(context, 'foo = 8');
      expect(() => iterator.next()).toThrow(
        `Current context is forbidden to modify`
      );
    });

    test('Variable declaration to non-extensible context', () => {
      const context = testContext({});
      Object.preventExtensions(context);
      const iterator = testIterate.statement(context, 'SET foo = 8');
      expect(() => iterator.next()).toThrow(
        `Current context is forbidden to extend`
      );
    });

    test('Variable declaration with existing identifier', () => {
      const context = testContext({ foo: { value: 42 } });
      const iterator = testIterate.statement(context, 'SET foo = 8');
      expect(() => iterator.next()).toThrow(
        `Identifier 'foo' is already declared`
      );
    });
  });

  describe('if statement', () => {
    test('If statement', () => {
      const context = testContext({});
      const iterator = testIterate.statement(context, 'IF 1 + 1 42');
      expect(iterator.next()).toEqual({
        value: 42,
        done: true
      });
    });

    test('If statement with else', () => {
      const context = testContext({});
      const iterator = testIterate.statement(context, 'IF 1 - 1 42 ELSE 8');
      expect(iterator.next()).toEqual({
        value: 8,
        done: true
      });
    });

    test('If statement with else if', () => {
      const context = testContext({});
      const iterator = testIterate.statement(
        context,
        'IF 1 - 1 42 ELSE IF 1 + 1 8'
      );
      expect(iterator.next()).toEqual({
        value: 8,
        done: true
      });
    });

    test('If statement with else if and else', () => {
      const context = testContext({});
      const iterator = testIterate.statement(
        context,
        'IF 1 - 1 42 ELSE IF 1 - 1 8 ELSE 4'
      );
      expect(iterator.next()).toEqual({
        value: 4,
        done: true
      });
    });

    test('If statement with else if and else if', () => {
      const context = testContext({});
      const iterator = testIterate.statement(
        context,
        'IF 1 - 1 42 ELSE IF 1 - 1 8 ELSE IF 1 + 1 4'
      );
      expect(iterator.next()).toEqual({
        value: 4,
        done: true
      });
    });

    test('If statement with else if and else if and else', () => {
      const context = testContext({});
      const iterator = testIterate.statement(
        context,
        'IF 1 - 1 42 ELSE IF 1 - 1 8 ELSE IF 1 - 1 4 ELSE 2'
      );
      expect(iterator.next()).toEqual({
        value: 2,
        done: true
      });
    });
  });

  describe('block statement', () => {
    // Block statement is created using indentation like in Python
    test('Block statement', () => {
      const context = testContext({
        result: { value: 0, writable: true }
      });
      const iterator = testIterate.statement(
        context,
        `
        SET foo = 42
        SET bar = 8
        result = foo + bar
    `
      );
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
      const context = testContext({});
      const iterator = testIterate.statement(
        context,
        `
        SET foo = 42
            SET bar = 8`
      );
      expect(() => iterator.next()).toThrow(`Broken indentation`);
    });
  });
});
