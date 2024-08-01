import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AbstractConstructor } from 'type-fest';

import { AbstractLogEntry } from 'src/logger/entry/abstract';
import { ObservableResult } from 'src/types/rx';

export function instancesOf<I>(classType: AbstractConstructor<I>) {
  return function <E>(source: Observable<E>) {
    return source.pipe(
      filter((value) => value instanceof classType) // TypeScript requires a type assertion here
    ) as unknown as Observable<Extract<E, I>>;
  };
}

export const filterLogs = () => instancesOf(AbstractLogEntry);

export const filterResult = () => instancesOf(ObservableResult);
