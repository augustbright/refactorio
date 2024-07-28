import {
  TBlock,
  TExpression,
  TOperator,
  TProgram,
  TStatement
} from './types/ast';
import { TToken } from './types/tokens';

export function parse(tokens: TToken[]) {
  let current = 0;
  let indentation = 0;

  function parseArguments(): TExpression[] {
    const result: TExpression[] = [];
    while (tokens[current].type !== 'RPAREN') {
      result.push(parseExpression());
      if (tokens[current].type === 'COMMA') current++;
    }
    current++;
    return result;
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

    if (token.type === 'LPAREN') {
      current++;
      const expression = parseExpression();
      if (tokens[current].type !== 'RPAREN') {
        throw new Error('Expected closing parenthesis');
      }
      current++;
      return expression;
    }

    throw new Error('Invalid primary expression');
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
        indentation >= blockIndentation &&
        current < tokens.length &&
        tokens[current].type !== 'NEWLINE'
      );

      if (tokens[current] && tokens[current].type === 'NEWLINE') {
        current++;
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
      if (tokens[current].type !== 'INDENTATION') {
        throw new Error('Expected indentation');
      }
      if (tokens[current].value.length <= indentation) {
        throw new Error('Broken indentation');
      }
      indentation = tokens[current].value.length;
      return parseBlock(indentation);
    }

    return parseCommonStatement();
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

  function skipSpace() {
    while (
      tokens[current]?.type === 'NEWLINE' ||
      tokens[current]?.type === 'INDENTATION'
    ) {
      current++;
    }
  }

  function parseCommonStatement(): TStatement {
    const token = tokens[current];
    if (token.type === 'REPLACE') {
      current++;
      const selector = parseExpression();
      skipSpace();
      if (tokens[current].type !== 'WITH') {
        throw new Error('Expected WITH after expression');
      }
      current++;
      const newValue = parseExpression();
      current++;
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

    throw new Error(`Unexpected token: ${token.type}`);
  }

  function parseRootStatement(): TStatement {
    while (tokens[current].type === 'NEWLINE') {
      current++;
    }
    if (tokens[current].type === 'INDENTATION') {
      throw new Error('Unexpected indentation');
    }

    const token = tokens[current];
    if (token.type === 'SET') {
      current++;
      const name = tokens[current];
      current++;
      if (tokens[current].type !== 'ASSIGN') {
        throw new Error('Expected = after variable name');
      }
      current++;
      return {
        type: 'VariableDeclaration',
        name: name.value,
        value: parseExpression()
      };
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

    return result;
  }

  return parseProgram();
}
