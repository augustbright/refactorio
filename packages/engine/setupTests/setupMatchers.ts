import { expect } from '@jest/globals';

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

expect.extend({
  // toReceive
});
