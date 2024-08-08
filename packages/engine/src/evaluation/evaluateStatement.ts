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
      return yield* evaluateExpression(context, statement);
    case 'VariableDeclaration':
      return declare(context, statement.name, {
        value: yield* evaluateExpression(context, statement.value)
      });
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
