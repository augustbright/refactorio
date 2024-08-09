import { TokenWalker } from './TokenWalker';
import { parseObjectLiteral } from './parseObjectLiteral';

import { BINARY_EXPRESSION_OPERATORS_TOKEN_TYPES } from 'src/tokens/TOKEN_TYPES';
import { TBinaryExpressionOperatorTokenType, TToken } from 'src/tokens/types';
import { TExpression } from 'src/types';
import { UnreachableCaseError } from 'src/utils/UnreachableCaseError';

export function parseExpression(walker: TokenWalker): TExpression {
  const left = parseMemberExpression(walker);
  return parseBinaryExpression(walker, left, 1);
}

function parseBinaryExpression(
  walker: TokenWalker,
  left: TExpression,
  minPrecedence: number
): TExpression {
  let lookahead = walker.current;
  while (
    lookahead &&
    isBinaryExpressionOperator(lookahead) &&
    getPrecedence(lookahead) >= minPrecedence
  ) {
    const operator = lookahead;
    walker.step();
    let right = parseMemberExpression(walker);
    lookahead = walker.current;
    while (lookahead && getPrecedence(lookahead) > getPrecedence(operator)) {
      right = parseBinaryExpression(walker, right, getPrecedence(lookahead));
      lookahead = walker.current;
    }
    left = {
      type: 'BinaryExpression',
      operator: operator.type,
      left: left,
      right: right,
      loc: {
        start: left.loc.start,
        end: right.loc.end,
        column: left.loc.column,
        line: left.loc.line
      }
    };
  }
  return left;
}

function isBinaryExpressionOperator(
  operator: TToken
): operator is TToken<TBinaryExpressionOperatorTokenType> {
  return BINARY_EXPRESSION_OPERATORS_TOKEN_TYPES.some(
    (token) => token.type === operator.type
  );
}

function getPrecedence(operator: TToken) {
  if (!isBinaryExpressionOperator(operator)) return 0;

  switch (operator.type) {
    case 'AND':
    case 'OR':
      return 1;
    case 'UNEQUALITY':
    case 'EQUALITY':
    case 'LESS_THAN':
    case 'LESS_THAN_OR_EQUAL':
    case 'GREATER_THAN':
    case 'GREATER_THAN_OR_EQUAL':
      return 2;
    case 'PLUS':
    case 'MINUS':
      return 3;
    case 'MULTIPLY':
    case 'DIVIDE':
      return 4;
    default:
      throw new UnreachableCaseError(operator.type);
  }
}

function parseMemberExpression(walker: TokenWalker) {
  let expression = parsePrimaryExpression(walker);

  //TODO computed member
  while (walker.is(['DOT', 'LPAREN'])) {
    if (walker.is('DOT')) {
      const property = walker.currentValue;
      if (!property) {
        throw new SyntaxError('Expected property name');
      }
      walker.step();
      expression = {
        type: 'MemberExpression',
        object: expression,
        property,
        loc: {
          start: expression.loc.start,
          end: expression.loc.end + property.length,
          column: expression.loc.column,
          line: expression.loc.line
        }
      };
    }

    if (walker.is('LPAREN')) {
      walker.step();
      const args = parseArguments(walker);
      expression = {
        type: 'CallExpression',
        callee: expression,
        arguments: args,
        loc: {
          start: expression.loc.start,
          end:
            (args.length ? args[args.length - 1].loc.end : expression.loc.end) +
            1,
          column: expression.loc.column,
          line: expression.loc.line
        }
      };
    }
  }

  return expression;
}

function parsePrimaryExpression(walker: TokenWalker): TExpression {
  const token = walker.current;
  if (!token) {
    throw new SyntaxError('Unexpected end of input');
  }

  switch (token.type) {
    case 'WORD':
      walker.step();
      return {
        type: 'Identifier',
        name: token.value,
        loc: token.loc
      };
    case 'BOOLEAN':
      walker.step();
      return {
        type: 'Literal',
        value: token.value === 'TRUE',
        loc: token.loc
      };
    case 'NUMBER':
      walker.step();
      return {
        type: 'Literal',
        value: Number(token.value),
        loc: token.loc
      };
    case 'STRING':
      walker.step();
      return {
        type: 'Literal',
        value: token.value.slice(1, -1),
        loc: token.loc
      };
    case 'LCB':
      return parseObjectLiteral(walker);
  }

  if (token.type === 'LPAREN') {
    walker.step();
    const expression = parseExpression(walker);
    walker.assertType('RPAREN', 'Expected closing parenthesis');
    walker.step();
    return expression;
  }

  throw new SyntaxError('Invalid primary expression');
}

function parseArguments(walker: TokenWalker): TExpression[] {
  const result: TExpression[] = [];
  while (!walker.is('RPAREN')) {
    result.push(parseExpression(walker));

    walker.assertType(
      ['COMMA', 'RPAREN'],
      'Unexpected token found while parsing function arguments'
    );
    walker.skipSingle('COMMA');
  }
  walker.step();
  return result;
}
