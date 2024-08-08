import { testContext, testIterate } from '../testUtils';

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
});
