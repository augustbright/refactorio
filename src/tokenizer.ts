import { TToken } from './types/tokens';

export function tokenize(input: string): TToken[] {
  const tokens = [];
  const tokenTypes = [
    { regex: /^\/\/.*(\n|$)/, type: 'COMMENT' },

    { regex: /^SET/, type: 'SET' },
    { regex: /^IF/, type: 'IF' },
    { regex: /^ELSE/, type: 'ELSE' },
    { regex: /^REPLACE/, type: 'REPLACE' },
    { regex: /^WITH/, type: 'WITH' },
    { regex: /^AND/, type: 'AND' },
    { regex: /^OR/, type: 'OR' },

    { regex: /^==/, type: 'EQUALITY' },
    { regex: /^!=/, type: 'UNEQUALITY' },
    { regex: /^=/, type: 'ASSIGN' },

    { regex: /^\(/, type: 'LPAREN' },
    { regex: /^\)/, type: 'RPAREN' },
    { regex: /^\+/, type: 'PLUS' },
    { regex: /^-/, type: 'MINUS' },
    { regex: /^\*/, type: 'MULTIPLY' },
    { regex: /^\//, type: 'DIVIDE' },
    { regex: /^,/, type: 'COMMA' },
    { regex: /^\.([a-zA-Z_][a-zA-Z0-9_]*)/, type: 'DOT' },

    { regex: /^TRUE/, type: 'BOOLEAN' },
    { regex: /^FALSE/, type: 'BOOLEAN' },
    { regex: /^'[^']*'/, type: 'STRING' },
    { regex: /^\d+/, type: 'NUMBER' },

    { regex: /^[a-zA-Z_][a-zA-Z0-9_]*/, type: 'IDENTIFIER' },
    { regex: /^'[^']*'/, type: 'STRING' },
    { regex: /^\n/, type: 'NEWLINE' },
    { regex: /^\s+/, type: 'WHITESPACE' }
  ];

  let lineStart = true;
  while (input.length > 0) {
    let matched = false;
    for (const tokenType of tokenTypes) {
      const match = input.match(tokenType.regex);
      if (match) {
        switch (tokenType.type) {
          case 'COMMENT':
            break;
          case 'NEWLINE':
            tokens.push({ type: tokenType.type, value: '' });
            lineStart = true;
            break;
          case 'WHITESPACE':
            if (lineStart) {
              tokens.push({ type: 'INDENTATION', value: match[0] });
              lineStart = false;
            }
            break;
          case 'DOT':
            tokens.push({ type: tokenType.type, value: match[1] });
            break;
          default:
            tokens.push({ type: tokenType.type, value: match[0] });
            lineStart = false;
        }

        input = input.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw new Error(`Unexpected token: ${input[0]}`);
    }
  }
  return tokens;
}
