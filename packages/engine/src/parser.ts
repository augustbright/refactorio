import { TTokenWalker } from './parsing/TTokenWalker';
import { type TTokenType, Tokenizer } from './tokens';
import {
  TBlock,
  TExpression,
  TObjectLiteral,
  TOperator,
  TProgram,
  TSelectorPattern,
  TStatement
} from './types/ast';

class SyntaxError extends Error {
  constructor(message?: string) {
    super(message);
    this.message = 'Syntax error: ' + message;
  }
}

export function parse(code: string) {
  const tokens = new Tokenizer(code).tokenize();
  const walker = new TTokenWalker(tokens);
  let indentation = 0;

  function currentIntendedTokenIs(
    requiredIndentation: number,
    tokenType: TTokenType | TTokenType[]
  ) {
    if (!requiredIndentation) return walker.is(tokenType);
    if (
      walker.is('INDENTATION') &&
      walker.currentValue?.length === requiredIndentation &&
      walker.is(tokenType, 1)
    ) {
      walker.step(1);
      return true;
    }
    return false;
  }

  function parsePatternFilter(): TExpression[] {
    walker.assertType('LSB', 'Expected pattern filter');
    const result: TExpression[] = [];
    walker.step();
    while (!walker.is('RSB')) {
      result.push(parseExpression());
      walker.assertType(
        ['COMMA', 'RSB'],
        'Unexpected token found while parsing selector pattern filter'
      );
      walker.skipSingle('COMMA');
    }
    walker.step();

    return result;
  }

  function parseSelectorPattern(): TSelectorPattern {
    const nodeType = walker.assertType(
      'IDENTIFIER',
      'Expected Selector pattern'
    ).value;
    walker.step();

    let filter: TExpression[] | undefined;
    if (walker.is('LSB')) {
      filter = parsePatternFilter();
    }

    return {
      type: 'TSelectorPattern',
      nodeType,
      filter
    };
  }

  function parseSelectorPatterns(): TSelectorPattern[] {
    const patterns: TSelectorPattern[] = [];
    while (walker.is('IDENTIFIER')) {
      const pattern = parseSelectorPattern();
      patterns.push(pattern);
    }

    return patterns;
  }

  function parseArguments(): TExpression[] {
    const result: TExpression[] = [];
    while (!walker.is('RPAREN')) {
      result.push(parseExpression());

      walker.assertType(
        ['COMMA', 'RPAREN'],
        'Unexpected token found while parsing function arguments'
      );
      walker.skipSingle('COMMA');
    }
    walker.step();
    return result;
  }

  function parseObjectLiteral(): TObjectLiteral {
    walker.assertType(
      'LCB',
      'Expected object literal, but got unexpected token'
    );
    walker.step();
    const map: TObjectLiteral['map'] = {};

    while (!walker.is('RCB')) {
      const key = walker.assertType(
        'IDENTIFIER',
        'Expected object literal, but got unexpected token'
      ).value;

      walker.step();

      walker.assertType('COLON', 'Expected ":", but got');
      walker.step();

      const expression = parseExpression();
      walker.assertType(
        ['COMMA', 'RCB'],
        'Unexpected token found while parsing object literal'
      );
      walker.skipSingle('COMMA');
      map[key] = expression;
    }
    walker.step();

    return {
      type: 'ObjectLiteral',
      map
    };
  }

  function parsePrimaryExpression(): TExpression {
    const token = walker.current;
    if (!token) {
      throw new SyntaxError('Unexpected end of input');
    }

    switch (token.type) {
      case 'IDENTIFIER':
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
        return parseObjectLiteral();
    }

    if (token.type === 'LPAREN') {
      walker.step();
      const expression = parseExpression();
      walker.assertType('RPAREN', 'Expected closing parenthesis');
      walker.step();
      return expression;
    }

    throw new SyntaxError('Invalid primary expression');
  }

  function parseMemberExpression() {
    let expression = parsePrimaryExpression();

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
          arguments: parseArguments()
        };
      }
    }

    return expression;
  }

  function parseBinaryExpression(
    left: TExpression,
    minPrecedence: number
  ): TExpression {
    let lookahead = walker.current;
    while (lookahead && getPrecedence(lookahead.type) >= minPrecedence) {
      const operator = lookahead;
      walker.step();
      let right = parseMemberExpression();
      lookahead = walker.current;
      while (
        lookahead &&
        getPrecedence(lookahead.type) > getPrecedence(operator.type)
      ) {
        right = parseBinaryExpression(right, getPrecedence(lookahead.type));
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

  function parseExpression(): TExpression {
    const left = parseMemberExpression();
    return parseBinaryExpression(left, 1);
  }

  function parseBlock(blockIndentation: number): TBlock {
    const body = [];

    while (!walker.done) {
      const token = walker.current;
      if (!token) {
        throw new SyntaxError('Unexpected end of input');
      }
      if (!walker.is('INDENTATION')) {
        indentation = 0;
        break;
      }
      if (token.value.length < blockIndentation) {
        indentation = token.value.length;
        break;
      }
      walker.step();

      do {
        body.push(parseCommonStatement());
      } while (
        !walker.done &&
        indentation >= blockIndentation &&
        !walker.is(['INDENTATION', 'NEWLINE'])
      );

      walker.skip('NEWLINE');
    }

    return {
      type: 'Block',
      body
    };
  }

  function parseStatement(): TStatement {
    if (walker.is('NEWLINE')) {
      walker.step();
      const indentationToken = walker.assertType(
        'INDENTATION',
        'Expected indentation'
      );
      if (indentationToken.value.length <= indentation) {
        throw new SyntaxError('Broken indentation');
      }
      indentation = indentationToken.value.length;
      return parseBlock(indentation);
    }

    return parseCommonStatement();
  }

  function parseCommonStatement(): TStatement {
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
        value: parseExpression()
      };
    }
    if (walker.is('IN')) {
      walker.step();
      const selector = parseSelectorPatterns();

      walker.assertType('AS', 'Expected AS after selector');
      walker.step();

      const alias = walker.currentValue;
      if (!alias) {
        throw new SyntaxError('Expected alias name');
      }
      walker.step();
      const statement = parseStatement();
      return {
        type: 'InStatement',
        alias,
        selector,
        statement
      };
    }
    if (walker.is('REPLACE')) {
      walker.step();
      const selector = parseSelectorPatterns();
      walker.skip(['NEWLINE', 'INDENTATION']);

      walker.assertType('WITH', 'Expected WITH');
      walker.step();

      const newValue = parseExpression();

      let andStatement: TStatement | undefined;
      let orStatement: TStatement | undefined;
      if (walker.skip(['INDENTATION', 'NEWLINE'], 'AND')) {
        walker.step();
        andStatement = parseStatement();
      }
      if (walker.skip(['INDENTATION', 'NEWLINE'], 'OR')) {
        walker.step();
        orStatement = parseStatement();
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
      const requiredIndentation = indentation;
      walker.step();
      const condition = parseExpression();
      const statement = parseStatement();
      let elseStatement: TStatement | undefined;
      if (currentIntendedTokenIs(requiredIndentation, 'ELSE')) {
        walker.step();
        elseStatement = parseStatement();
      }

      return {
        type: 'IfStatement',
        condition: condition,
        statement: statement,
        elseStatement
      };
    }
    if (walker.is('IDENTIFIER') && walker.is('ASSIGN', 1)) {
      const name = walker.currentValue;
      if (!name) {
        throw new SyntaxError('Expected variable name');
      }
      walker.step(2);
      return {
        type: 'Assignment',
        name,
        value: parseExpression()
      };
    }
    if (walker.is('IDENTIFIER') && !walker.is('ASSIGN', 1)) {
      return parseExpression();
    }

    throw new SyntaxError(`Unexpected token: ${walker.currentValue}`);
  }

  function parseRootStatement(): TStatement {
    if (walker.is('INDENTATION'))
      throw new SyntaxError('Unexpected indentation');

    return parseCommonStatement();
  }

  function parseProgram(): TProgram {
    const body = [];

    while (true) {
      walker.skip('NEWLINE');
      if (walker.done) break;
      body.push(parseRootStatement());
    }

    const result: TProgram = {
      type: 'Program',
      body
    };

    return result;
  }

  return parseProgram();
}
