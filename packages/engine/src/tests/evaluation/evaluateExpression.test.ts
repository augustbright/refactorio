import { testIterate } from '../testUtils';

describe('evaluateExpression', () => {
  test('literal', () => {
    const iterator = testIterate.expression({}, '42');
    expect(iterator.next()).toEqual({
      value: 42,
      done: true
    });
  });
  test('identifier', () => {
    const iterator = testIterate.expression({ foo: { value: 42 } }, 'foo');
    expect(iterator.next()).toEqual({
      value: 42,
      done: true
    });
  });
  test('binary expression', () => {
    const iterator = testIterate.expression(
      {
        foo: { value: 42 },
        bar: { value: 8 }
      },
      'foo + bar'
    );

    expect(iterator.next()).toEqual({
      value: 50,
      done: true
    });
  });
  test('member expression', () => {
    const iterator = testIterate.expression(
      {
        foo: {
          value: {
            bar: 42
          }
        }
      },
      'foo.bar'
    );
    expect(iterator.next()).toEqual({
      value: 42,
      done: true
    });
  });
  test('call expression', () => {
    const iterator = testIterate.expression(
      {
        foo: {
          value: (a: number, b: number) => a + b
        }
      },
      'foo(1, 2)'
    );
    expect(iterator.next()).toEqual({
      value: 3,
      done: true
    });
  });
  test('object literal', () => {
    const iterator = testIterate.expression({}, '{ foo: 42 }');
    expect(iterator.next()).toEqual({
      value: { foo: 42 },
      done: true
    });
  });
});
