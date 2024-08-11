import { get } from 'lodash';
import { UnknownRecord } from 'type-fest';

import { step } from './debugger';
import { getValue } from './evaluationContext';
import { TEvaluationContext, TEvaluator } from './types';

import { ErrorManager } from 'src/errors';
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
      return getValue(context, expression.name, expression.loc);
    case 'BinaryExpression': {
      return yield* step(
        context,
        expression,
        evaluateBinaryExpression(context, expression)
      );
    }
    case 'MemberExpression':
      return yield* step(
        context,
        expression,
        member(context, expression.object, expression.property)
      );
    case 'CallExpression':
      return yield* step(
        context,
        expression,
        call(context, expression.callee, expression.arguments)
      );
    case 'ObjectLiteral':
      return yield* step(context, expression, object(context, expression));
    default:
      ErrorManager.throw(
        new UnreachableCaseError(expression),
        get(expression, 'loc')
      );
  }
}

function* evaluateBinaryExpression(
  context: TEvaluationContext,
  expression: TBinaryExpression
): TEvaluator {
  const left = yield* evaluateExpression(context, expression.left);
  const right = yield* evaluateExpression(context, expression.right);

  const assertNumbers = (operator: string, left: unknown, right: unknown) => {
    if (typeof left === 'number' && typeof right === 'number') {
      return true;
    }
    return throwCannotApply(operator, left, right);
  };

  const throwCannotApply = (operator: string, left: unknown, right: unknown) =>
    ErrorManager.throw(
      new Error(
        `Cannot apply operator ${operator} on values ${JSON.stringify(left)} and ${JSON.stringify(right)}`
      ),
      expression.loc
    );

  if (expression.operator === 'PLUS') {
    if (typeof left === 'number' && typeof right === 'number') {
      return left + right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left + right;
    }
    return throwCannotApply('+', left, right);
  } else if (expression.operator === 'MINUS') {
    assertNumbers('-', left, right);
    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }
  } else if (expression.operator === 'MULTIPLY') {
    assertNumbers('*', left, right);
    if (typeof left === 'number' && typeof right === 'number') {
      return left * right;
    }
  } else if (expression.operator === 'DIVIDE') {
    assertNumbers('/', left, right);
    if (typeof left === 'number' && typeof right === 'number') {
      return left / right;
    }
  } else if (expression.operator === 'EQUALITY') {
    return left === right;
  } else if (expression.operator === 'UNEQUALITY') {
    return left !== right;
  } else if (expression.operator === 'GREATER_THAN') {
    assertNumbers('>', left, right);
    if (typeof left === 'number' && typeof right === 'number') {
      return left > right;
    }
  } else if (expression.operator === 'GREATER_THAN_OR_EQUAL') {
    assertNumbers('>=', left, right);
    if (typeof left === 'number' && typeof right === 'number') {
      return left >= right;
    }
  } else if (expression.operator === 'LESS_THAN') {
    assertNumbers('<', left, right);
    if (typeof left === 'number' && typeof right === 'number') {
      return left < right;
    }
  } else if (expression.operator === 'LESS_THAN_OR_EQUAL') {
    assertNumbers('<=', left, right);
    if (typeof left === 'number' && typeof right === 'number') {
      return left <= right;
    }
  } else if (expression.operator === 'AND') {
    return left && right;
  } else if (expression.operator === 'OR') {
    return left || right;
  } else {
    ErrorManager.throw(
      new UnreachableCaseError(expression.operator),
      get(expression, 'loc')
    );
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
  ErrorManager.throw(
    new Error(`Cannot get property of ${JSON.stringify(object)}`),
    expression.loc
  );
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
    return func.call(null, ...evaluatedArgs) as unknown;
  }
  ErrorManager.throw(new Error(`Expression is not callable`), expression.loc);
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
