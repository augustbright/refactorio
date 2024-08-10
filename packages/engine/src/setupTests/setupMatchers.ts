import type { MatcherFunction } from 'expect';

import { type TNodeExpectation } from 'src/tests/testUtils/types';

// Keep this as an example of how to create custom matchers

// const toReceive: MatcherFunction<Array<unknown>> =
//   // `floor` and `ceiling` get types from the line above
//   // it is recommended to type them as `unknown` and to validate the values
//   function (observer, ...entries) {
//     if (!(observer instanceof MockObserver)) {
//       throw new TypeError('Actual value is not a MockObserver');
//     }

//     if (observer.complete.mock.calls.length === 0) {
//       throw new Error('Observable has not finished yet');
//     }

//     const actual = observer.next.mock.calls.map(property(0));
//     if (this.equals(actual, entries, [areAbstractLogEntriesEqual])) {
//       return {
//         message: () =>
//           `expected observer not to receive
//         ${this.utils.printExpected(entries)}`,
//         pass: true
//       };
//     } else {
//       return {
//         message: () =>
//           `expected observer to receive
//           ${this.utils.printExpected(entries)},
//           but received
//           ${this.utils.printReceived(actual)}`,
//         pass: false
//       };
//     }
//   };

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
      message: () => `expected iterator result not to suspend on node`,
      pass: true
    };
  } else {
    return {
      message: () => `expected iterator result to suspend on node`,
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
        `expected iterator result to be done, but received not done`,
      pass: false
    };
  }
};

const toHaveValue: MatcherFunction<[unknown]> = function (actual, value) {
  if (this.equals(actual, expect.objectContaining({ value }))) {
    return {
      message: () =>
        `expected iterator result not to have value ${value}, but received ${value}`,
      pass: true
    };
  } else {
    return {
      message: () =>
        `expected iterator result to have value ${value}, but received ${value}`,
      pass: false
    };
  }
};

expect.extend({
  toSuspendOn,
  toBeDone,
  toHaveValue
});
