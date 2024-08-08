import path from 'path';

import { evaluateExpression } from 'src/evaluation/evaluateExpression';
import { evaluateProgram } from 'src/evaluation/evaluateProgram';
import { evaluateStatement } from 'src/evaluation/evaluateStatement';
import {
  TContextOptions,
  createDebuggingContext,
  createEvaluationContext,
  setDebugging
} from 'src/evaluation/evaluationContext';
import { TEvaluationContext } from 'src/evaluation/types';
import { TokenWalker } from 'src/parsing/TokenWalker';
import { parseExpression } from 'src/parsing/parseExpression';
import { parseProgram } from 'src/parsing/parseProgram';
import { parseStatement } from 'src/parsing/parseStatement';

export const mockRepoPath = () => {
  return path.join(process.cwd(), 'tests/mock-repo/');
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface IMockObserver<Value, Error> {
  next: jest.Mock<void, [Value]>;
  complete: jest.Mock<void>;
  error: jest.Mock<void, [Error]>;
}

export class MockObserver<Value, Error = unknown>
  implements IMockObserver<Value, Error>
{
  next: jest.Mock<void, [Value]>;
  complete: jest.Mock<void, []>;
  error: jest.Mock<void, [Error]>;

  constructor(observer: Partial<IMockObserver<Value, Error>> = {}) {
    this.next = observer.next || jest.fn();
    this.complete = observer.complete || jest.fn();
    this.error = observer.error || jest.fn();
  }
}

export const mockObserver = <Value, Error = unknown>(
  observer: Partial<IMockObserver<Value, Error>> = {}
) => new MockObserver(observer);

export const waitUntilCalled = (fn: jest.Mock, timeout: number = 10_000) =>
  new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      if (fn.mock.calls.length > 0) {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        resolve(null);
      }
    }, 50);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error("Function hasn't been called within the allowed time"));
    }, timeout);
  });

export const waitUntilComplete = <Value, Error>(
  observer: MockObserver<Value, Error>
) => waitUntilCalled(observer.complete);

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

export const testIterate = {
  expression: (context: TEvaluationContext, expression: string) =>
    evaluateExpression(context, parseExpression(TokenWalker.from(expression))),
  statement: (context: TEvaluationContext, statement: string) =>
    evaluateStatement(context, parseStatement(TokenWalker.from(statement))),
  program: (context: TEvaluationContext, program: string) =>
    evaluateProgram(context, parseProgram(TokenWalker.from(program)))
};
