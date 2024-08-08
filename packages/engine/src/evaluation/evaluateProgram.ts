import { parse, print } from 'recast';
import { UnknownRecord } from 'type-fest';

import {
  createEvaluationContext,
  declare,
  getValue,
  isDebugging,
  isSuspended,
  updateValue
} from './evaluationContext';
import {
  TEvaluationContext,
  TEvaluator,
  TParser,
  TScriptDefinition
} from './types';

import {
  TBinaryExpression,
  TExpression,
  TObjectLiteral,
  TStatement
} from 'src/types';
import { ObservableResult } from 'src/types/rx';
import { UnreachableCaseError } from 'src/utils/UnreachableCaseError';
import { parseScript } from 'src/utils/parseScript';

type TTransformCodeOptions = {
  code: string;
  script: TScriptDefinition;
  parser: TParser;
  context: TEvaluationContext;
};

export class TransformCodeResult extends ObservableResult<{
  isChanged: boolean;
  code: string;
}> {}

function* step(context: TEvaluationContext, evaluator: TEvaluator): TEvaluator {
  if (
    isDebugging(context) &&
    isSuspended(context) &&
    (yield {}) === 'step into'
  ) {
    return yield* stepInto(evaluator);
  }
  return yield* stepOver(evaluator);
}

function* stepOver(evaluator: TEvaluator): TEvaluator {
  while (true) {
    const { value, done } = evaluator.next();
    if (done) {
      return value;
    }
    if (value.breakpoint) {
      yield value;
    }
  }
}
function* stepInto(evaluator: TEvaluator): TEvaluator {
  return yield* evaluator;
}

export function* evaluateCode({
  code,
  script,
  parser,
  context: parentContext
}: TTransformCodeOptions): TEvaluator {
  const ast = parse(code, { parser });
  const isChanged = false;

  const context = createEvaluationContext({}, { parent: parentContext });

  const program = parseScript(script);

  for (const statement of program.body) {
    yield* evaluateStatement(context, statement);
  }

  return new TransformCodeResult({ code: print(ast).code, isChanged });
}

export function* evaluateStatement(
  context: TEvaluationContext,
  statement: TStatement
): TEvaluator {
  switch (statement.type) {
    case 'ObjectLiteral':
    case 'BinaryExpression':
    case 'Identifier':
    case 'Literal':
    case 'MemberExpression':
      return yield* evaluateExpression(context, statement);
    case 'VariableDeclaration':
      return declare(context, statement.name, {
        value: yield* evaluateExpression(context, statement.value)
      });
    case 'CallExpression':
      return yield* call(context, statement.callee, statement.arguments);
    case 'Assignment':
      return updateValue(
        context,
        statement.name,
        yield* evaluateExpression(context, statement.value)
      );
    case 'IfStatement':
      if (yield* evaluateExpression(context, statement.condition)) {
        return yield* evaluateStatement(context, statement.statement);
      } else if (statement.elseStatement) {
        return yield* evaluateStatement(context, statement.elseStatement);
      }
      return;
    case 'Block': {
      const blockContext = createEvaluationContext({}, { parent: context });
      for (const blockStatement of statement.body) {
        yield* evaluateStatement(blockContext, blockStatement);
      }
      return;
    }
    case 'InStatement':
      throw 'Not implemented';
    case 'ReplaceStatement':
      throw 'not implemented';
    default:
      throw new UnreachableCaseError(statement);
  }
}

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

export function* evaluateBinaryExpression(
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
