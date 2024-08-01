import { expect } from '@jest/globals';

import { isEqual } from 'lodash';

import { AbstractLogEntry } from '../src/logger/entry/abstract';

export function areAbstractLogEntriesEqual(
  a: AbstractLogEntry<unknown>,
  b: AbstractLogEntry<unknown>
) {
  const isALogEntry = a instanceof AbstractLogEntry;
  const isBLogEntry = b instanceof AbstractLogEntry;

  if (isALogEntry && isBLogEntry) {
    return (
      a.level === b.level && a.type === b.type && isEqual(a.payload, b.payload)
    );
  } else if (isALogEntry === isBLogEntry) {
    return undefined;
  } else {
    return false;
  }
}

expect.addEqualityTesters([areAbstractLogEntriesEqual]);
