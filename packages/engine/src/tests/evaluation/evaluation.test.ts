import { createTestEvaluationContext } from '../testUtils';

import { evaluateExpression } from 'src/evaluation/evaluateProgram';

describe('evaluateExpression', () => {
  test('literal', () => {
    const iterator = evaluateExpression(createTestEvaluationContext({}), {
      type: 'Literal',
      value: 42
    });
    expect(iterator.next()).toEqual({
      value: 42,
      done: true
    });
  });
  test('identifier', () => {
    const context = createTestEvaluationContext({
      foo: {
        value: 42
      }
    });
    const iterator = evaluateExpression(context, {
      type: 'Identifier',
      name: 'foo'
    });
    expect(iterator.next()).toEqual({
      value: 42,
      done: true
    });
  });
  test('binary expression', () => {
    const context = createTestEvaluationContext({
      foo: {
        value: 42
      },
      bar: {
        value: 8
      }
    });
    const iterator = evaluateExpression(context, {
      type: 'BinaryExpression',
      operator: 'PLUS',
      left: {
        type: 'Identifier',
        name: 'foo'
      },
      right: {
        type: 'Identifier',
        name: 'bar'
      }
    });

    expect(iterator.next()).toEqual({
      value: 50,
      done: true
    });
  });
  test('member expression', () => {
    const context = createTestEvaluationContext({
      foo: {
        value: {
          bar: 42
        }
      }
    });
    const iterator = evaluateExpression(context, {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'foo'
      },
      property: 'bar'
    });
    expect(iterator.next()).toEqual({
      value: 42,
      done: true
    });
  });
  test('call expression', () => {
    const context = createTestEvaluationContext({
      foo: {
        value: (a: number, b: number) => a + b
      }
    });
    const iterator = evaluateExpression(context, {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'foo'
      },
      arguments: [
        {
          type: 'Literal',
          value: 1
        },
        {
          type: 'Literal',
          value: 2
        }
      ]
    });
    expect(iterator.next()).toEqual({
      value: 3,
      done: true
    });
  });
});
