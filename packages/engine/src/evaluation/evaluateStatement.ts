import { step } from './debugger';
import { evaluateExpression } from './evaluateExpression';
import {
  createEvaluationContext,
  declare,
  updateValue
} from './evaluationContext';
import { TEvaluationContext, TEvaluator } from './types';

import { TStatement } from 'src/types';
import { UnreachableCaseError } from 'src/utils/UnreachableCaseError';

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
    case 'CallExpression':
      return yield* step(
        context,
        statement,
        evaluateExpression(context, statement)
      );
    case 'VariableDeclaration':
      return declare(context, statement.name, {
        value: yield* step(
          context,
          statement,
          evaluateExpression(context, statement.value)
        ),
        writable: true
      });
    case 'Assignment':
      return updateValue(
        context,
        statement.name,
        yield* step(
          context,
          statement.value,
          evaluateExpression(context, statement.value)
        )
      );
    case 'IfStatement':
      if (
        yield* step(
          context,
          statement.condition,
          evaluateExpression(context, statement.condition)
        )
      ) {
        return yield* step(
          context,
          statement.statement,
          evaluateStatement(context, statement.statement)
        );
      } else if (statement.elseStatement) {
        return yield* step(
          context,
          statement.elseStatement,
          evaluateStatement(context, statement.elseStatement)
        );
      }
      return;
    case 'Block': {
      const blockContext = createEvaluationContext({}, { parent: context });
      for (const blockStatement of statement.body) {
        yield* step(
          context,
          blockStatement,
          evaluateStatement(blockContext, blockStatement)
        );
      }
      return;
    }
    case 'Breakpoint':
      yield {
        breakpoint: true
      };
      return;
    case 'InStatement':
      throw 'Not implemented';
    case 'ReplaceStatement':
      throw 'not implemented';
    default:
      throw new UnreachableCaseError(statement);
  }
}
