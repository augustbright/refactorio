import 'jest-extended';
import { type TNodeExpectation } from './tests/testUtils/types';
declare global {
  declare namespace jest {
    interface Matchers<R> {
      toReceive(...entries: unknown[]): R;
      toSuspendOn(expected: TNodeExpectation): R;
      toBeDone(): R;
      toHaveValue(value?: unknown): R;
    }
  }
}

import 'jest-chain';
