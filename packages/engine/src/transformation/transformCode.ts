import { Readable } from 'stream';

import { parseScript } from '../utils/parseScript';
import { withStreamResult } from '../utils/withStreamResult';
import { TGlobalContext, TParser, TScriptDefinition } from './types';

import {
  TBinaryExpression,
  TExpression,
  TObjectLiteral,
  TStatement
} from 'src/types';
import { AssertTrue, Equals } from 'src/types/utils';

type TTransformCodeOptions = {
  code: string;
  script: TScriptDefinition;
  parser: TParser;
  globalContext: TGlobalContext;
};

type TTransformCodeResult = {
  isChanged: boolean;
  code: string;
};

export const transformCode = withStreamResult(
  async (
    out: Readable,
    {
      code,
      // parser,
      script,
      globalContext
    }: TTransformCodeOptions
  ): Promise<TTransformCodeResult> => {
    // const ast = parse(code, { parser });
    // const changed = false;
    const globals: Record<string, unknown> = {
      print: (text: string) => {
        out.push(text);
      },
      context: globalContext
    } as const;
    const declarations: Record<string, unknown> = {};

    const declare = ({ name, value }: { name: string; value: unknown }) => {
      if (name in globals)
        throw new Error(`Cannot redeclare global identifier '${name}'`);
      if (name in declarations)
        throw new Error(`Identifier '${name}' is already declared`);

      declarations[name] = value;
    };

    const setValue = ({ name, value }: { name: string; value: unknown }) => {
      if (name in declarations) declarations[name] = value;
      if (name in globals)
        throw new Error(`Cannot modify value of global '${name}'`);

      throw new Error(`'${name}' is not defined`);
    };

    const getValue = ({ name }: { name: string }) => {
      if (name in declarations) return declarations[name];
      if (name in globals) return globals[name];

      throw new Error(`'${name}' is not defined`);
    };

    const member = async (
      expression: TExpression,
      property: string
    ): Promise<unknown> => {
      const object = await evaluateExpression(expression);
      if (typeof object === 'object' && object !== null) {
        return (object as Record<string, unknown>)[property];
      }
      throw new Error(`Cannot get property of ${object}`);
    };

    const call = async (
      expression: TExpression,
      args: TExpression[]
    ): Promise<unknown> => {
      const func = await evaluateExpression(expression);
      if (typeof func === 'function') {
        return func.call(
          null,
          ...(await Promise.all(args.map(evaluateExpression)))
        );
      }
      throw new Error(`Expression is not callable`);
    };

    const object = async (
      expression: TObjectLiteral
    ): Promise<Record<string, unknown>> => {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(expression.map).map(async ([key, expression]) => [
            key,
            await evaluateExpression(expression)
          ])
        )
      );
    };

    const evaluateBinaryExpression = async (expression: TBinaryExpression) => {
      const left = await evaluateExpression(expression.left);
      const right = await evaluateExpression(expression.right);

      if (expression.operator === 'PLUS') {
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return left + right;
        }
        throw new Error(
          `Cannot apply operator '+' on values ${left} and ${right}`
        );
      } else if (expression.operator === 'MINUS') {
        if (typeof left === 'number' && typeof right === 'number') {
          return left - right;
        }
        throw new Error(
          `Cannot apply operator '-' on values ${left} and ${right}`
        );
      } else if (expression.operator === 'MULTIPLY') {
        if (typeof left === 'number' && typeof right === 'number') {
          return left * right;
        }
        throw new Error(
          `Cannot apply operator '*' on values ${left} and ${right}`
        );
      } else if (expression.operator === 'DIVIDE') {
        if (typeof left === 'number' && typeof right === 'number') {
          return left / right;
        }
        throw new Error(
          `Cannot apply operator '/' on values ${left} and ${right}`
        );
      } else if (expression.operator === 'EQUALITY') {
        return left === right;
      } else if (expression.operator === 'UNEQUALITY') {
        return left !== right;
      } else if (expression.operator === 'AND') {
        return left && right;
      } else if (expression.operator === 'OR') {
        return left || right;
      } else {
        true as AssertTrue<Equals<typeof expression.operator, never>>;
        throw new Error(`Unknown operator type: ${expression.operator}`);
      }
    };

    const evaluateExpression = async (
      expression: TExpression
    ): Promise<unknown> => {
      switch (expression.type) {
        case 'Literal':
          return expression.value;
        case 'Identifier':
          return getValue({ name: expression.name });
        case 'BinaryExpression':
          return await evaluateBinaryExpression(expression);
        case 'MemberExpression':
          return member(expression.object, expression.property);
        case 'CallExpression':
          return call(expression.callee, expression.arguments);
        case 'ObjectLiteral':
          return object(expression);
        default:
          true as AssertTrue<Equals<typeof expression, never>>;
          // @ts-expect-error expression should be of type "never"
          throw new Error(`Unknown expression type: ${expression.type}`);
      }
    };

    const evaluateStatement = async (statement: TStatement) => {
      switch (statement.type) {
        case 'ObjectLiteral':
        case 'BinaryExpression':
        case 'Identifier':
        case 'Literal':
        case 'MemberExpression':
          evaluateExpression(statement);
          break;
        case 'VariableDeclaration':
          declare({
            name: statement.name,
            value: await evaluateExpression(statement.value)
          });
          break;
        case 'CallExpression':
          await call(statement.callee, statement.arguments);
          break;
        case 'Assignment':
          setValue({
            name: statement.name,
            value: await evaluateExpression(statement.value)
          });
          break;
        case 'IfStatement':
          if (await evaluateExpression(statement.condition)) {
            await evaluateStatement(statement.statement);
          } else if (statement.elseStatement) {
            await evaluateStatement(statement.elseStatement);
          }
          break;
        case 'Block':
          await Promise.all(statement.body.map(evaluateStatement));
          break;
        case 'InStatement':
          throw 'Not implemented';
        case 'ReplaceStatement':
          throw 'not implemented';
        default:
          true as AssertTrue<Equals<typeof statement, never>>;
          // @ts-expect-error statement should be of type "never"
          throw new Error(`Unknown statement type: ${statement.type}`);
      }
    };

    const program = parseScript(script);

    await Promise.all(program.body.map(evaluateStatement));

    return {
      isChanged: false,
      code
    };
  }
);
