import { TEvaluationContext } from './types';

import { ErrorManager } from 'src/errors';
import { TLocation } from 'src/types';

export type TContextOptions = {
  freeze?: boolean;
  parent?: TEvaluationContext;
};

const DEBUGGING_SYMBOLS = {
  isDebugging: Symbol('isDebugging'),
  isSuspended: Symbol('isSuspended')
} as const;

export const createEvaluationContext = (
  properties: PropertyDescriptorMap,
  options?: TContextOptions
): TEvaluationContext => {
  const context = Object.create(null);
  Object.defineProperties(context, properties);
  if (options?.parent) {
    Object.setPrototypeOf(context, options.parent);
  }
  if (options?.freeze) {
    Object.freeze(context);
  }
  return context;
};

export const createDebuggingContext = () => {
  return createEvaluationContext({
    [DEBUGGING_SYMBOLS.isDebugging]: {
      value: false,
      writable: true,
      configurable: false,
      enumerable: false
    },
    [DEBUGGING_SYMBOLS.isSuspended]: {
      value: false,
      writable: true,
      configurable: false,
      enumerable: false
    }
  });
};

export const declare = (
  context: TEvaluationContext,
  key: string,
  descriptor: PropertyDescriptor,
  loc: TLocation
) => {
  if (
    Object.isFrozen(context) ||
    Object.isSealed(context) ||
    !Object.isExtensible(context)
  ) {
    return ErrorManager.throw(
      new TypeError(`Current context is forbidden to extend`),
      loc
    );
  }
  if (Object.getOwnPropertyDescriptor(context, key)) {
    return ErrorManager.throw(
      new TypeError(`Identifier '${key}' is already declared`),
      loc
    );
  }

  Object.defineProperty(context, key, descriptor);
};

export const updateValue = <T>(
  context: TEvaluationContext,
  key: string,
  value: T,
  loc: TLocation
): T => {
  if (Object.isFrozen(context)) {
    return ErrorManager.throw(
      new TypeError(`Current context is forbidden to modify`),
      loc
    );
  }
  const ownDescriptor = Object.getOwnPropertyDescriptor(context, key);
  if (!ownDescriptor) {
    if (Object.getPrototypeOf(context)) {
      return updateValue(Object.getPrototypeOf(context), key, value, loc);
    } else {
      return ErrorManager.throw(
        new ReferenceError(`'${key}' is not defined`),
        loc
      );
    }
  }
  if (!ownDescriptor.writable) {
    return ErrorManager.throw(
      new TypeError(`Identifier '${key}' is read-only`),
      loc
    );
  }
  return (context[key] = value);
};

export const getValue = (
  context: TEvaluationContext,
  key: string,
  loc: TLocation
) => {
  if (key in context) {
    return context[key];
  }

  return ErrorManager.throw(new ReferenceError(`'${key}' is not defined`), loc);
};

export const hasOwnValue = (context: TEvaluationContext, key: string) => {
  return Object.prototype.hasOwnProperty.call(context, key);
};

export const getOwnValue = (
  context: TEvaluationContext,
  key: string,
  loc: TLocation
) => {
  if (hasOwnValue(context, key)) {
    return context[key];
  }

  return ErrorManager.throw(
    new ReferenceError(`'${key}' is not defined in current context`),
    loc
  );
};

export const isDebugging = (context: TEvaluationContext) => {
  return context[DEBUGGING_SYMBOLS.isDebugging] as boolean;
};

export const isSuspended = (context: TEvaluationContext) => {
  return context[DEBUGGING_SYMBOLS.isSuspended] as boolean;
};

export const setDebugging = (context: TEvaluationContext, value: boolean) => {
  context[DEBUGGING_SYMBOLS.isDebugging] = value;
};

export const setSuspended = (context: TEvaluationContext, value: boolean) => {
  context[DEBUGGING_SYMBOLS.isSuspended] = value;
};
