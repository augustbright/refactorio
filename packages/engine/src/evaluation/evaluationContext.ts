import { TEvaluationContext } from './types';

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
  descriptor: PropertyDescriptor
) => {
  if (
    Object.isFrozen(context) ||
    Object.isSealed(context) ||
    !Object.isExtensible(context)
  ) {
    throw new TypeError(`Current context is forbidden to extend`);
  }
  if (Object.getOwnPropertyDescriptor(context, key)) {
    throw new TypeError(`Identifier '${key}' is already declared`);
  }

  Object.defineProperty(context, key, descriptor);
};

export const updateValue = <T>(
  context: TEvaluationContext,
  key: string,
  value: T
): T => {
  if (Object.isFrozen(context)) {
    throw new TypeError(`Current context is forbidden to modify`);
  }
  const ownDescriptor = Object.getOwnPropertyDescriptor(context, key);
  if (!ownDescriptor) {
    if (Object.getPrototypeOf(context)) {
      return updateValue(Object.getPrototypeOf(context), key, value);
    } else {
      throw new ReferenceError(`'${key}' is not defined`);
    }
  }
  if (!ownDescriptor.writable) {
    throw new TypeError(`Identifier '${key}' is read-only`);
  }
  return (context[key] = value);
};

export const getValue = (context: TEvaluationContext, key: string) => {
  if (key in context) {
    return context[key];
  }

  throw new ReferenceError(`'${key}' is not defined`);
};

export const hasOwnValue = (context: TEvaluationContext, key: string) => {
  return Object.prototype.hasOwnProperty.call(context, key);
};

export const getOwnValue = (context: TEvaluationContext, key: string) => {
  if (hasOwnValue(context, key)) {
    return context[key];
  }

  throw new ReferenceError(`'${key}' is not defined in current context`);
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
