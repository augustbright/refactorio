/* eslint-disable @typescript-eslint/no-explicit-any */
import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export const instancesOf = <T>(
  C: new (...args: any[]) => T
): OperatorFunction<any, T> => filter((item: any) => item instanceof C);
