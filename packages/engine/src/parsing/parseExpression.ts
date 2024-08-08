import { TokenWalker } from './TokenWalker';
import { parseObjectLiteral } from './parseObjectLiteral';

import { TExpression, TOperator } from 'src/types';

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
  while (lookahead && getPrecedence(lookahead.type) >= minPrecedence) {
    const operator = lookahead;
    walker.step();
    let right = parseMemberExpression(walker);
    lookahead = walker.current;
    while (
      lookahead &&
      getPrecedence(lookahead.type) > getPrecedence(operator.type)
    ) {
      right = parseBinaryExpression(
        walker,
        right,
        getPrecedence(lookahead.type)
      );
      lookahead = walker.current;
    }
    left = {
      type: 'BinaryExpression',
      operator: operator.type as TOperator,
      left: left,
      right: right
    };
  }
  return left;
}

function getPrecedence(operator: string) {
  switch (operator) {
    case 'AND':
    case 'OR':
      return 1;
    case 'UNEQUALITY':
    case 'EQUALITY':
      return 2;
    case 'PLUS':
    case 'MINUS':
      return 3;
    case 'MULTIPLY':
    case 'DIVIDE':
      return 4;
    case 'DOT':
      return 5;
    default:
      return 0;
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
        property
      };
    }

    if (walker.is('LPAREN')) {
      walker.step();
      expression = {
        type: 'CallExpression',
        callee: expression,
        arguments: parseArguments(walker)
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
        name: token.value
      };
    case 'BOOLEAN':
      walker.step();
      return {
        type: 'Literal',
        value: token.value === 'TRUE'
      };
    case 'NUMBER':
      walker.step();
      return {
        type: 'Literal',
        value: Number(token.value)
      };
    case 'STRING':
      walker.step();
      return {
        type: 'Literal',
        value: token.value.slice(1, -1)
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
