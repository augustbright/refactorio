import { UnknownRecord } from 'type-fest';

import { step } from './debugger';
import { getValue } from './evaluationContext';
import { TEvaluationContext, TEvaluator } from './types';

import { TBinaryExpression, TExpression, TObjectLiteral } from 'src/types';
import { UnreachableCaseError } from 'src/utils/UnreachableCaseError';

export function* evaluateExpression(
  context: TEvaluationContext,
  expression: TExpression
): TEvaluator {
  switch (expression.type) {
    case 'Literal':
      return expression.value;
    case 'Identifier':
      return getValue(context, expression.name);
    case 'BinaryExpression': {
      return yield* step(
        context,
        evaluateBinaryExpression(context, expression)
      );
    }
    case 'MemberExpression':
      return yield* step(
        context,
        member(context, expression.object, expression.property)
      );
    case 'CallExpression':
      return yield* step(
        context,
        call(context, expression.callee, expression.arguments)
      );
    case 'ObjectLiteral':
      return yield* step(context, object(context, expression));
    default:
      throw new UnreachableCaseError(expression);
  }
}

function* evaluateBinaryExpression(
  context: TEvaluationContext,
  expression: TBinaryExpression
): TEvaluator {
  const left = yield* evaluateExpression(context, expression.left);
  const right = yield* evaluateExpression(context, expression.right);

  if (expression.operator === 'PLUS') {
    if (typeof left === 'number' && typeof right === 'number') {
      return left + right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left + right;
    }
    throw new Error(`Cannot apply operator '+' on values ${left} and ${right}`);
  } else if (expression.operator === 'MINUS') {
    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }
    throw new Error(`Cannot apply operator '-' on values ${left} and ${right}`);
  } else if (expression.operator === 'MULTIPLY') {
    if (typeof left === 'number' && typeof right === 'number') {
      return left * right;
    }
    throw new Error(`Cannot apply operator '*' on values ${left} and ${right}`);
  } else if (expression.operator === 'DIVIDE') {
    if (typeof left === 'number' && typeof right === 'number') {
      return left / right;
    }
    throw new Error(`Cannot apply operator '/' on values ${left} and ${right}`);
  } else if (expression.operator === 'EQUALITY') {
    return left === right;
  } else if (expression.operator === 'UNEQUALITY') {
    return left !== right;
  } else if (expression.operator === 'AND') {
    return left && right;
  } else if (expression.operator === 'OR') {
    return left || right;
  } else {
    throw new UnreachableCaseError(expression.operator);
  }
}

function* member(
  context: TEvaluationContext,
  expression: TExpression,
  property: string
): TEvaluator {
  const object = yield* evaluateExpression(context, expression);
  if (typeof object === 'object' && object !== null) {
    return (object as Record<string, unknown>)[property];
  }
  throw new Error(`Cannot get property of ${object}`);
}

function* call(
  context: TEvaluationContext,
  expression: TExpression,
  args: TExpression[]
): TEvaluator {
  const func = yield* evaluateExpression(context, expression);
  if (typeof func === 'function') {
    const evaluatedArgs = [];
    for (const arg of args) {
      evaluatedArgs.push(yield* evaluateExpression(context, arg));
    }
    return func.call(null, ...evaluatedArgs);
  }
  throw new Error(`Expression is not callable`);
}

function* object(
  context: TEvaluationContext,
  expression: TObjectLiteral
): TEvaluator {
  const mapEntries = Object.entries(expression.map);
  const result: UnknownRecord = {};
  for (const [key, value] of mapEntries) {
    result[key] = yield* evaluateExpression(context, value);
  }
  return result;
}
