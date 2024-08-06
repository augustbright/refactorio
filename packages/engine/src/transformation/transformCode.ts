import { parse, print } from 'recast';

import {
  createChildContext,
  declare,
  getValue,
  updateValue
} from './evaluationContext';
import { TEvaluationContext, TParser, TScriptDefinition } from './types';

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

export const transformCode = ({
  code,
  script,
  parser,
  context: parentContext
}: TTransformCodeOptions) => {
  const ast = parse(code, { parser });
  const isChanged = false;

  const context = createChildContext(parentContext, {});

  const program = parseScript(script);

  program.body.forEach((statement) => {
    evaluateStatement(context, statement);
  });

  return new TransformCodeResult({ code: print(ast).code, isChanged });
};

// export const transformCode = ({
//   code,
//   script,
//   parser,
//   context
// }: TTransformCodeOptions) =>
//   new Observable<TAnyEntry | TransformCodeResult>((subscriber) => {
//     const ast = parse(code, { parser });
//     const isChanged = false;

//     const program = parseScript(script);

//     const subscription = from(program.body)
//       .pipe(
//         concatMap((statement) => from(evaluateStatement(context, statement)))
//       )
//       .subscribe({
//         complete() {
//           subscriber.next(
//             new TransformCodeResult({ code: print(ast).code, isChanged })
//           );
//           subscriber.complete();
//         },
//         error(error) {
//           subscriber.error(error);
//         },
//         next() {}
//       });

//     return function teardown() {
//       subscription.unsubscribe();
//     };
//   });

const member = async (
  context: TEvaluationContext,
  expression: TExpression,
  property: string
): Promise<unknown> => {
  const object = await evaluateExpression(context, expression);
  if (typeof object === 'object' && object !== null) {
    return (object as Record<string, unknown>)[property];
  }
  throw new Error(`Cannot get property of ${object}`);
};

const call = async (
  context: TEvaluationContext,
  expression: TExpression,
  args: TExpression[]
): Promise<unknown> => {
  const func = await evaluateExpression(context, expression);
  if (typeof func === 'function') {
    return func.call(
      null,
      ...(await Promise.all(
        args.map((arg) => evaluateExpression(context, arg))
      ))
    );
  }
  throw new Error(`Expression is not callable`);
};

const object = async (
  context: TEvaluationContext,
  expression: TObjectLiteral
): Promise<Record<string, unknown>> => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(expression.map).map(async ([key, expression]) => [
        key,
        await evaluateExpression(context, expression)
      ])
    )
  );
};

const evaluateBinaryExpression = async (
  context: TEvaluationContext,
  expression: TBinaryExpression
) => {
  const left = await evaluateExpression(context, expression.left);
  const right = await evaluateExpression(context, expression.right);

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
};

const evaluateExpression = async (
  context: TEvaluationContext,
  expression: TExpression
): Promise<unknown> => {
  switch (expression.type) {
    case 'Literal':
      return expression.value;
    case 'Identifier':
      return getValue(context, expression.name);
    case 'BinaryExpression':
      return await evaluateBinaryExpression(context, expression);
    case 'MemberExpression':
      return member(context, expression.object, expression.property);
    case 'CallExpression':
      return call(context, expression.callee, expression.arguments);
    case 'ObjectLiteral':
      return object(context, expression);
    default:
      throw new UnreachableCaseError(expression);
  }
};

const evaluateStatement = async (
  context: TEvaluationContext,
  statement: TStatement
) => {
  switch (statement.type) {
    case 'ObjectLiteral':
    case 'BinaryExpression':
    case 'Identifier':
    case 'Literal':
    case 'MemberExpression':
      evaluateExpression(context, statement);
      break;
    case 'VariableDeclaration':
      declare(context, statement.name, {
        value: await evaluateExpression(context, statement.value)
      });
      break;
    case 'CallExpression':
      await call(context, statement.callee, statement.arguments);
      break;
    case 'Assignment':
      updateValue(
        context,
        statement.name,
        await evaluateExpression(context, statement.value)
      );
      break;
    case 'IfStatement':
      if (await evaluateExpression(context, statement.condition)) {
        await evaluateStatement(context, statement.statement);
      } else if (statement.elseStatement) {
        await evaluateStatement(context, statement.elseStatement);
      }
      break;
    case 'Block':
      await Promise.all(
        statement.body.map((statement) =>
          evaluateStatement(createChildContext(context, {}), statement)
        )
      );
      break;
    case 'InStatement':
      throw 'Not implemented';
    case 'ReplaceStatement':
      throw 'not implemented';
    default:
      throw new UnreachableCaseError(statement);
  }
};
