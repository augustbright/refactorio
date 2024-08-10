import { TokenWalker } from './TokenWalker';
import { parseExpression } from './parseExpression';
import { parseSelectorPatterns } from './parseSelectorPatters';
import { parseStatement } from './parseStatement';

import { ErrorManager } from 'src/errors';
import { TStatement } from 'src/types';
import { EMPTY_LOCATION } from 'src/utils/location/emptyLocation';

export function parseCommonStatement(walker: TokenWalker): TStatement {
  const commonStatement = walker.current;

  if (commonStatement?.type === 'BREAKPOINT' && walker.currentLoc) {
    walker.step();
    return {
      type: 'Breakpoint',
      loc: commonStatement.loc
    };
  }
  if (commonStatement?.type === 'SET') {
    walker.step();

    const name = walker.current;
    if (!name) {
      return ErrorManager.throw(
        new SyntaxError('Expected variable name'),
        walker.currentLoc || EMPTY_LOCATION
      );
    }
    walker.step();

    walker.assertType('ASSIGN', 'Expected = after variable name');
    walker.step();

    const value = parseExpression(walker);

    return {
      type: 'VariableDeclaration',
      name: name.value,
      value,
      loc: {
        start: commonStatement.loc.start,
        end: value.loc.end,
        column: commonStatement.loc.column,
        line: commonStatement.loc.line
      }
    };
  }
  if (commonStatement?.type === 'IN') {
    walker.step();
    const selector = parseSelectorPatterns(walker);

    walker.assertType('AS', 'Expected AS after selector');
    walker.step();

    const alias = walker.currentValue;
    if (!alias) {
      return ErrorManager.throw(
        new SyntaxError('Expected alias name'),
        walker.currentLoc || EMPTY_LOCATION
      );
    }
    walker.step();
    const statement = parseStatement(walker);
    return {
      type: 'InStatement',
      alias,
      selector,
      statement,
      loc: {
        start: commonStatement.loc.start,
        column: commonStatement.loc.column,
        line: commonStatement.loc.line,
        end: statement.loc.end
      }
    };
  }
  if (commonStatement?.type === 'REPLACE') {
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
      orStatement,
      loc: {
        start: commonStatement.loc.start,
        column: commonStatement.loc.column,
        line: commonStatement.loc.line,
        end: orStatement?.loc.end || andStatement?.loc.end || newValue.loc.end
      }
    };
  }
  if (commonStatement?.type === 'IF') {
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
      elseStatement,
      loc: {
        start: commonStatement.loc.start,
        column: commonStatement.loc.column,
        line: commonStatement.loc.line,
        end: elseStatement?.loc.end || statement.loc.end
      }
    };
  }
  if (commonStatement?.type === 'WORD' && walker.is('ASSIGN', 1)) {
    const name = walker.currentValue;
    if (!name) {
      // throw new SyntaxError('Expected variable name');
      return ErrorManager.throw(
        new SyntaxError('Expected variable name'),
        walker.currentLoc || EMPTY_LOCATION
      );
    }
    walker.step(2);
    const value = parseExpression(walker);
    return {
      type: 'Assignment',
      name,
      value,
      loc: {
        start: commonStatement.loc.start,
        column: commonStatement.loc.column,
        line: commonStatement.loc.line,
        end: value.loc.end
      }
    };
  }

  return parseExpression(walker);
}
