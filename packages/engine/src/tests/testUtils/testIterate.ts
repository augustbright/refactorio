import { evaluateExpression } from 'src/evaluation/evaluateExpression';
import { evaluateProgram } from 'src/evaluation/evaluateProgram';
import { evaluateStatement } from 'src/evaluation/evaluateStatement';
import { TEvaluationContext } from 'src/evaluation/types';
import { TokenWalker } from 'src/parsing/TokenWalker';
import { parseExpression } from 'src/parsing/parseExpression';
import { parseProgram } from 'src/parsing/parseProgram';
import { parseStatement } from 'src/parsing/parseStatement';

export const testIterate = {
  expression: (context: TEvaluationContext, expression: string) =>
    evaluateExpression(context, parseExpression(TokenWalker.from(expression))),
  statement: (context: TEvaluationContext, statement: string) =>
    evaluateStatement(context, parseStatement(TokenWalker.from(statement))),
  program: (context: TEvaluationContext, program: string) =>
    evaluateProgram(context, parseProgram(TokenWalker.from(program)))
};
