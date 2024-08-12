/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { MatcherFunction } from 'expect';

import { type TNodeExpectation } from 'src/tests/testUtils/types';

const toSuspendOn: MatcherFunction<[TNodeExpectation]> = function (
  actual,
  expected
) {
  if (
    this.equals(actual, {
      done: expect.toBeFalse(),
      value: expect.objectContaining({
        node: expected
      })
    })
  ) {
    return {
      message: () =>
        `expected iterator result not to suspend on node ${this.utils.printExpected(expected)}
        but received ${this.utils.printReceived(actual)}`,
      pass: true
    };
  } else {
    return {
      message:
        () => `expected iterator result to suspend on node ${this.utils.printExpected(expected)}
      but received ${this.utils.printReceived(actual)}`,
      pass: false
    };
  }
};

const toBeDone: MatcherFunction<[]> = function (actual) {
  if (this.equals(actual, expect.objectContaining({ done: true }))) {
    return {
      message: () =>
        `expected iterator result not to be done, but received done`,
      pass: true
    };
  } else {
    return {
      message: () =>
        `expected iterator result to be done, but received not done,
        with value ${this.utils.printReceived(actual)}`,
      pass: false
    };
  }
};

const toHaveValue: MatcherFunction<[unknown]> = function (actual, value) {
  if (this.equals(actual, expect.objectContaining({ value }))) {
    return {
      message: () =>
        `expected iterator result not to have value ${JSON.stringify(value)}, but received ${JSON.stringify(value)}`,
      pass: true
    };
  } else {
    return {
      message: () =>
        `expected iterator result to have value ${JSON.stringify(value)}, but received ${JSON.stringify(value)}`,
      pass: false
    };
  }
};

expect.extend({
  toSuspendOn,
  toBeDone,
  toHaveValue
});
