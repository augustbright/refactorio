import 'jest-extended';
declare global {
  declare namespace jest {
    interface Matchers<R> {
      toReceive(...entries: unknown[]): R;
    }
  }
}

import 'jest-chain';
