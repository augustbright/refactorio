import { TEvaluationContext } from './types';

type TContextOptions = {
  freeze?: boolean;
};

export const createEvaluationContext = (
  properties: PropertyDescriptorMap,
  options?: TContextOptions
): TEvaluationContext => {
  const context = Object.create(null);
  Object.defineProperties(context, properties);
  if (options?.freeze) {
    Object.freeze(context);
  }
  return context;
};

export const createChildContext = (
  parent: TEvaluationContext,
  properties: PropertyDescriptorMap,
  options?: TContextOptions
): TEvaluationContext => {
  const context = createEvaluationContext(properties);
  Object.setPrototypeOf(context, parent);
  if (options?.freeze) {
    Object.freeze(context);
  }
  return context;
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
    throw new TypeError(`Identifier '${name}' is already declared`);
  }

  Object.defineProperty(context, key, descriptor);
};

export const updateValue = (
  context: TEvaluationContext,
  key: string,
  value: unknown
) => {
  if (Object.isFrozen(context)) {
    throw new TypeError(`Current context is forbidden to modify`);
  }
  const descriptor = Object.getOwnPropertyDescriptor(context, key);
  if (!descriptor) {
    throw new ReferenceError(`${key} is not defined`);
  }
  if (!descriptor.writable) {
    throw new TypeError(`Identifier '${name}' is already declared`);
  }
  context[key] = value;
};

export const getValue = (context: TEvaluationContext, key: string) => {
  if (key in context) {
    return context[key];
  }

  throw new ReferenceError(`'${name}' is not defined`);
};
