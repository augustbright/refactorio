import {
  TContextOptions,
  createDebuggingContext,
  createEvaluationContext,
  setDebugging
} from 'src/evaluation/evaluationContext';

export * from './asyncMatchers';
export * from './testIterate';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const testContext = (
  properties: PropertyDescriptorMap,
  options?: TContextOptions
) => {
  const debuggingContext = createDebuggingContext();
  setDebugging(debuggingContext, true);
  return createEvaluationContext(properties, {
    ...options,
    parent: debuggingContext
  });
};
