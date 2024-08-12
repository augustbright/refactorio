import { testIterate } from '../testUtils';

describe('evaluateExpression', () => {
  test('literal', () => {
    const { iterator } = testIterate.expression`42`;
    expect(iterator.next('step')).toBeDone().toHaveValue(42);
  });
  test('identifier', () => {
    const { iterator, context } = testIterate.expression`foo`;
    context.foo = 42;
    expect(iterator.next('step')).toBeDone().toHaveValue(42);
  });
  test('binary expression', () => {
    const { iterator, context } = testIterate.expression`foo + bar`;
    context.foo = 10;
    context.bar = 40;

    expect(iterator.next('step')).toBeDone().toHaveValue(50);
  });
  test('member expression', () => {
    const { iterator, context } = testIterate.expression`foo.bar`;
    context.foo = { bar: 42 };
    expect(iterator.next('step')).toBeDone().toHaveValue(42);
  });
  test('call expression', () => {
    const { iterator, context } = testIterate.expression`foo(1, 2)`;
    context.foo = (a: number, b: number) => a + b;

    expect(iterator.next('step')).toBeDone().toHaveValue(3);
  });
  test('object literal', () => {
    const { iterator } = testIterate.expression`{ foo: 42 }`;
    expect(iterator.next('step')).toBeDone().toHaveValue({ foo: 42 });
  });
});
