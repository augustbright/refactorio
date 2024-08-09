export const BINARY_EXPRESSION_OPERATORS_TOKEN_TYPES = [
  { regex: /^==/, type: 'EQUALITY' },
  { regex: /^!=/, type: 'UNEQUALITY' },
  { regex: /^</, type: 'LESS_THAN' },
  { regex: /^<=/, type: 'LESS_THAN_OR_EQUAL' },
  { regex: /^>/, type: 'GREATER_THAN' },
  { regex: /^>=/, type: 'GREATER_THAN_OR_EQUAL' },
  { regex: /^AND/, type: 'AND' },
  { regex: /^OR/, type: 'OR' },
  { regex: /^\+/, type: 'PLUS' },
  { regex: /^-/, type: 'MINUS' },
  { regex: /^\*/, type: 'MULTIPLY' },
  { regex: /^\//, type: 'DIVIDE' }
] as const;

export const EXPRESSION_OPERATORS_TOKEN_TYPES = [
  ...BINARY_EXPRESSION_OPERATORS_TOKEN_TYPES,
  { regex: /^\.([a-zA-Z_][a-zA-Z0-9_]*)/, type: 'DOT' }
] as const;

export const TOKEN_TYPES = [
  { regex: /^\/\/.*(\n|$)/, type: 'COMMENT' },

  { regex: /^SET/, type: 'SET' },
  { regex: /^IF/, type: 'IF' },
  { regex: /^ELSE/, type: 'ELSE' },
  { regex: /^IN/, type: 'IN' },
  { regex: /^AS/, type: 'AS' },
  { regex: /^REPLACE/, type: 'REPLACE' },
  { regex: /^WITH/, type: 'WITH' },
  { regex: /^REMOVE/, type: 'REMOVE' },
  { regex: /^FUNCTION/, type: 'FUNCTION' },

  { regex: /^BREAKPOINT/, type: 'BREAKPOINT' },

  ...EXPRESSION_OPERATORS_TOKEN_TYPES,
  { regex: /^=/, type: 'ASSIGN' },

  { regex: /^\(/, type: 'LPAREN' },
  { regex: /^\)/, type: 'RPAREN' },
  { regex: /^\[/, type: 'LSB' },
  { regex: /^\]/, type: 'RSB' },
  { regex: /^\{/, type: 'LCB' },
  { regex: /^\}/, type: 'RCB' },
  { regex: /^:/, type: 'COLON' },
  { regex: /^,/, type: 'COMMA' },

  { regex: /^TRUE/, type: 'BOOLEAN' },
  { regex: /^FALSE/, type: 'BOOLEAN' },
  { regex: /^'[^']*'/, type: 'STRING' },
  { regex: /^\d+/, type: 'NUMBER' },

  { regex: /^[a-zA-Z_][a-zA-Z0-9_]*/, type: 'WORD' },
  { regex: /^'[^']*'/, type: 'STRING' },
  { regex: /^\n/, type: 'NEWLINE' },
  { regex: /^\s+/, type: 'INDENTATION' }
] as const;
