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
  { regex: /^AND/, type: 'AND' },
  { regex: /^OR/, type: 'OR' },

  { regex: /^==/, type: 'EQUALITY' },
  { regex: /^!=/, type: 'UNEQUALITY' },
  { regex: /^=/, type: 'ASSIGN' },

  { regex: /^\(/, type: 'LPAREN' },
  { regex: /^\)/, type: 'RPAREN' },
  { regex: /^\[/, type: 'LSB' },
  { regex: /^\]/, type: 'RSB' },
  { regex: /^\{/, type: 'LCB' },
  { regex: /^\}/, type: 'RCB' },
  { regex: /^:/, type: 'COLON' },
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
  { regex: /^\s+/, type: 'INDENTATION' }
] as const;
