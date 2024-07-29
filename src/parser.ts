import {
  TBlock,
  TExpression,
  TObjectLiteral,
  TOperator,
  TProgram,
  TSelectorPattern,
  TStatement
} from './types/ast';
import { TToken, TTokenType } from './types/tokens';

class SyntaxError extends Error {
  constructor(message?: string) {
    super(message);
    this.message = 'Syntax error: ' + message;
  }
}

export function parse(tokens: TToken[]) {
  let current = 0;
  let indentation = 0;

  function expectTokenType(
    tokenType: TTokenType | TTokenType[],
    errorMessage: string
  ) {
    const matches = [tokenType]
      .flat()
      .some((tokenType) => tokens[current].type === tokenType);

    if (!matches) {
      throw new SyntaxError(`${errorMessage}, got: "${tokens[current].value}"`);
    }
  }

  function skipSpace() {
    while (
      tokens[current]?.type === 'NEWLINE' ||
      tokens[current]?.type === 'INDENTATION'
    ) {
      current++;
    }
  }

  function skipNewline() {
    while (tokens[current] && tokens[current].type === 'NEWLINE') {
      current++;
    }
  }

  function currentIntendedTokenIs(
    requiredIndentation: number,
    tokenType: string
  ) {
    if (!requiredIndentation) return tokens[current].type === tokenType;
    if (
      tokens[current].type === 'INDENTATION' &&
      tokens[current].value.length === requiredIndentation &&
      tokens[current + 1] &&
      tokens[current + 1].type === tokenType
    ) {
      current++;
      return true;
    }
    return false;
  }

  function tokenAfterSpaceIs(tokenType: string) {
    let i = current;
    while (i < tokens.length) {
      if (tokens[i]?.type === 'NEWLINE' || tokens[i]?.type === 'INDENTATION') {
        i++;
      } else if (tokens[i]?.type === tokenType) {
        current = i;
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  function parsePatternFilter(): TExpression[] {
    expectTokenType('LSB', 'Expected pattern filter');
    const result: TExpression[] = [];
    current++;
    while (tokens[current].type !== 'RSB') {
      result.push(parseExpression());
      expectTokenType(
        ['COMMA', 'RSB'],
        'Unexpected token found while parsing selector pattern filter'
      );
      if (tokens[current].type === 'COMMA') current++;
    }
    current++;

    return result;
  }

  function parseSelectorPattern(): TSelectorPattern {
    expectTokenType('IDENTIFIER', 'Expected Selector pattern');
    const nodeType = tokens[current].value;
    current++;

    let filter: TExpression[] | undefined;
    if (tokens[current].type === 'LSB') {
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
    while (tokens[current].type === 'IDENTIFIER') {
      const pattern = parseSelectorPattern();
      patterns.push(pattern);
    }

    return patterns;
  }

  function parseArguments(): TExpression[] {
    const result: TExpression[] = [];
    while (tokens[current].type !== 'RPAREN') {
      result.push(parseExpression());
      if (
        tokens[current].type !== 'COMMA' &&
        tokens[current].type !== 'RPAREN'
      ) {
        throw new SyntaxError(
          `Unexpected token found while parsing function arguments: ${tokens[current].value}`
        );
      }
      if (tokens[current].type === 'COMMA') current++;
    }
    current++;
    return result;
  }

  function parseObjectLiteral(): TObjectLiteral {
    expectTokenType('LCB', 'Expected object literal, but got unexpected token');
    current++;
    const map: TObjectLiteral['map'] = {};

    while (tokens[current].type !== 'RCB') {
      expectTokenType(
        'IDENTIFIER',
        'Expected object literal, but got unexpected token'
      );

      const key = tokens[current].value;
      current++;

      expectTokenType('COLON', 'Expected ":", but got');
      current++;

      const expression = parseExpression();
      expectTokenType(
        ['COMMA', 'RCB'],
        'Unexpected token found while parsing object literal'
      );
      if (tokens[current].type === 'COMMA') current++;
      map[key] = expression;
    }
    current++;

    return {
      type: 'ObjectLiteral',
      map
    };
  }

  function parsePrimaryExpression(): TExpression {
    const token = tokens[current];

    if (token.type === 'IDENTIFIER') {
      current++;
      return {
        type: 'Identifier',
        name: token.value
      };
    }

    if (token.type === 'BOOLEAN') {
      current++;
      return {
        type: 'Literal',
        value: token.value === 'TRUE'
      };
    }

    if (token.type === 'NUMBER') {
      current++;
      return {
        type: 'Literal',
        value: Number(token.value)
      };
    }

    if (token.type === 'STRING') {
      current++;
      return {
        type: 'Literal',
        value: token.value.slice(1, -1)
      };
    }

    if (token.type === 'LCB') {
      return parseObjectLiteral();
    }

    if (token.type === 'LPAREN') {
      current++;
      const expression = parseExpression();
      expectTokenType('RPAREN', 'Expected closing parenthesis');
      current++;
      return expression;
    }

    throw new SyntaxError('Invalid primary expression');
  }

  function parseMemberExpression() {
    let expression = parsePrimaryExpression();

    //TODO computed member
    while (
      tokens[current] &&
      (tokens[current].type === 'DOT' || tokens[current].type === 'LPAREN')
    ) {
      if (tokens[current].type === 'DOT') {
        const property = tokens[current].value;
        current++;
        expression = {
          type: 'MemberExpression',
          object: expression,
          property
        };
      }

      if (tokens[current]?.type === 'LPAREN') {
        current++;
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
    let lookahead = tokens[current];
    while (lookahead && getPrecedence(lookahead.type) >= minPrecedence) {
      const operator = lookahead;
      current++;
      let right = parseMemberExpression();
      lookahead = tokens[current];
      while (
        lookahead &&
        getPrecedence(lookahead.type) > getPrecedence(operator.type)
      ) {
        right = parseBinaryExpression(right, getPrecedence(lookahead.type));
        lookahead = tokens[current];
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

    while (current < tokens.length) {
      const token = tokens[current];
      if (tokens[current].type !== 'INDENTATION') {
        indentation = 0;
        break;
      }
      if (token.value.length < blockIndentation) {
        indentation = token.value.length;
        break;
      }
      current++;

      do {
        body.push(parseCommonStatement());
      } while (
        current < tokens.length &&
        indentation >= blockIndentation &&
        tokens[current].type !== 'NEWLINE' &&
        tokens[current].type !== 'INDENTATION'
      );

      if (tokens[current] && tokens[current].type === 'NEWLINE') {
        skipNewline();
      }
    }

    return {
      type: 'Block',
      body
    };
  }

  function parseStatement(): TStatement {
    const token = tokens[current];
    if (token.type === 'NEWLINE') {
      current++;
      expectTokenType('INDENTATION', 'Expected indentation');
      if (tokens[current].value.length <= indentation) {
        throw new SyntaxError('Broken indentation');
      }
      indentation = tokens[current].value.length;
      return parseBlock(indentation);
    }

    return parseCommonStatement();
  }

  function parseCommonStatement(): TStatement {
    const token = tokens[current];
    if (token.type === 'SET') {
      current++;

      const name = tokens[current];
      current++;

      expectTokenType('ASSIGN', 'Expected = after variable name');
      current++;

      return {
        type: 'VariableDeclaration',
        name: name.value,
        value: parseExpression()
      };
    }
    if (token.type === 'IN') {
      current++;
      const selector = parseSelectorPatterns();

      expectTokenType('AS', 'Expected AS after selector');
      current++;

      const alias = tokens[current].value;
      current++;
      const statement = parseStatement();
      return {
        type: 'InStatement',
        alias,
        selector,
        statement
      };
    }
    if (token.type === 'REPLACE') {
      current++;
      const selector = parseSelectorPatterns();
      skipSpace();

      expectTokenType('WITH', 'Expected WITH');
      current++;

      const newValue = parseExpression();

      let andStatement: TStatement | undefined;
      let orStatement: TStatement | undefined;
      if (tokenAfterSpaceIs('AND')) {
        current++;
        andStatement = parseStatement();
      }
      if (tokenAfterSpaceIs('OR')) {
        current++;
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
    if (token.type === 'IF') {
      const requiredIndentation = indentation;
      current++;
      const condition = parseExpression();
      const statement = parseStatement();
      let elseStatement: TStatement | undefined;
      if (
        tokens[current] &&
        currentIntendedTokenIs(requiredIndentation, 'ELSE')
      ) {
        current++;
        elseStatement = parseStatement();
      }

      return {
        type: 'IfStatement',
        condition: condition,
        statement: statement,
        elseStatement
      };
    }
    if (token.type === 'IDENTIFIER' && tokens[current + 1].type === 'ASSIGN') {
      const name = token.value;
      current++;
      current++;
      return {
        type: 'Assignment',
        name,
        value: parseExpression()
      };
    }
    if (token.type === 'IDENTIFIER' && tokens[current + 1].type !== 'ASSIGN') {
      return parseExpression();
    }

    throw new SyntaxError(`Unexpected token: ${token.value}`);
  }

  function parseRootStatement(): TStatement {
    skipNewline();
    if (tokens[current].type === 'INDENTATION') {
      throw new SyntaxError('Unexpected indentation');
    }

    return parseCommonStatement();
  }

  function parseProgram(): TProgram {
    const body = [];

    while (current < tokens.length) {
      body.push(parseRootStatement());
    }

    const result: TProgram = {
      type: 'Program',
      body
    };

    console.log(JSON.stringify(result));

    return result;
  }

  return parseProgram();
}
