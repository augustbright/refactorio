import { fix, testContext } from '.';

import { evaluateExpression } from 'src/evaluation/evaluateExpression';
import { evaluateProgram } from 'src/evaluation/evaluateProgram';
import { evaluateStatement } from 'src/evaluation/evaluateStatement';
import { TokenWalker } from 'src/parsing/TokenWalker';
import { parseExpression } from 'src/parsing/parseExpression';
import { parseProgram } from 'src/parsing/parseProgram';
import { parseStatement } from 'src/parsing/parseStatement';

export const testIterate = {
  expression: (...args: Parameters<typeof fix>) => {
    const print = jest.fn();
    const context = testContext({
      print: { value: print }
    });
    return {
      context,
      iterator: evaluateExpression(
        context,
        parseExpression(TokenWalker.from(fix(...args)))
      ),
      print
    };
  },

  statement: (...args: Parameters<typeof fix>) => {
    const print = jest.fn();
    const context = testContext({
      print: { value: print }
    });
    return {
      context,
      iterator: evaluateStatement(
        context,
        parseStatement(TokenWalker.from(fix(...args)))
      ),
      print
    };
  },
  program: (...args: Parameters<typeof fix>) => {
    const print = jest.fn();
    const context = testContext({
      print: { value: print }
    });
    return {
      context,
      iterator: evaluateProgram(
        context,
        parseProgram(TokenWalker.from(fix(...args)))
      ),
      print
    };
  }
};
