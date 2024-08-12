import { config } from 'dotenv';

import { fix, testContext } from '.';

import { evaluateExpression } from 'src/evaluation/evaluateExpression';
import { evaluateProgram } from 'src/evaluation/evaluateProgram';
import { evaluateStatement } from 'src/evaluation/evaluateStatement';
import { TEvaluationYieldResponse, TEvaluator } from 'src/evaluation/types';
import { visualizeEvaluationPoint } from 'src/evaluation/utils/visualizeEvaluationPoint';
import { TokenWalker } from 'src/parsing/TokenWalker';
import { parseExpression } from 'src/parsing/parseExpression';
import { parseProgram } from 'src/parsing/parseProgram';
import { parseStatement } from 'src/parsing/parseStatement';

config();

export function withVisualizations(code: string, iterator: TEvaluator) {
  return {
    ...iterator,
    next: (value: TEvaluationYieldResponse) => {
      const result = iterator.next(value);
      if (process.env.VISUALIZE_EVALUATION_IN_UNIT_TESTS === 'true') {
        visualizeEvaluationPoint(code, result);
      }
      return result;
    }
  };
}

export const testIterate = {
  expression: (...args: Parameters<typeof fix>) => {
    const print = jest.fn();
    const context = testContext({
      print: { value: print }
    });
    const code = fix(...args);
    return {
      context,
      iterator: withVisualizations(
        code,
        evaluateExpression(context, parseExpression(TokenWalker.from(code)))
      ),
      print
    };
  },

  statement: (...args: Parameters<typeof fix>) => {
    const print = jest.fn();
    const context = testContext({
      print: { value: print }
    });
    const code = fix(...args);
    return {
      context,
      iterator: withVisualizations(
        code,
        evaluateStatement(context, parseStatement(TokenWalker.from(code)))
      ),
      print
    };
  },
  program: (...args: Parameters<typeof fix>) => {
    const print = jest.fn();
    const context = testContext({
      print: { value: print }
    });
    const code = fix(...args);
    return {
      context,
      iterator: withVisualizations(
        code,
        evaluateProgram(context, parseProgram(TokenWalker.from(code)))
      ),
      print
    };
  }
};
