import { TokenWalker } from './TokenWalker';
import { parseExpression } from './parseExpression';
import { parseSelectorPatterns } from './parseSelectorPatters';
import { parseStatement } from './parseStatement';

import { TStatement } from 'src/types';

export function parseCommonStatement(walker: TokenWalker): TStatement {
  if (walker.is('SET')) {
    walker.step();

    const name = walker.current;
    if (!name) {
      throw new SyntaxError('Expected variable name');
    }
    walker.step();

    walker.assertType('ASSIGN', 'Expected = after variable name');
    walker.step();

    return {
      type: 'VariableDeclaration',
      name: name.value,
      value: parseExpression(walker)
    };
  }
  if (walker.is('IN')) {
    walker.step();
    const selector = parseSelectorPatterns(walker);

    walker.assertType('AS', 'Expected AS after selector');
    walker.step();

    const alias = walker.currentValue;
    if (!alias) {
      throw new SyntaxError('Expected alias name');
    }
    walker.step();
    const statement = parseStatement(walker);
    return {
      type: 'InStatement',
      alias,
      selector,
      statement
    };
  }
  if (walker.is('REPLACE')) {
    walker.step();
    const selector = parseSelectorPatterns(walker);
    walker.skip(['NEWLINE', 'INDENTATION']);

    walker.assertType('WITH', 'Expected WITH');
    walker.step();

    const newValue = parseExpression(walker);

    let andStatement: TStatement | undefined;
    let orStatement: TStatement | undefined;
    if (walker.skip(['INDENTATION', 'NEWLINE'], 'AND')) {
      walker.step();
      andStatement = parseStatement(walker);
    }
    if (walker.skip(['INDENTATION', 'NEWLINE'], 'OR')) {
      walker.step();
      orStatement = parseStatement(walker);
    }
    return {
      type: 'ReplaceStatement',
      selector,
      newValue,
      andStatement,
      orStatement
    };
  }
  if (walker.is('IF')) {
    const requiredIndentation = walker.indentation;
    walker.step();
    const condition = parseExpression(walker);
    const statement = parseStatement(walker);
    let elseStatement: TStatement | undefined;
    if (walker.isIntended(requiredIndentation, 'ELSE')) {
      walker.step();
      elseStatement = parseStatement(walker);
    }

    return {
      type: 'IfStatement',
      condition: condition,
      statement: statement,
      elseStatement
    };
  }
  if (walker.is('WORD') && walker.is('ASSIGN', 1)) {
    const name = walker.currentValue;
    if (!name) {
      throw new SyntaxError('Expected variable name');
    }
    walker.step(2);
    return {
      type: 'Assignment',
      name,
      value: parseExpression(walker)
    };
  }

  return parseExpression(walker);
}
