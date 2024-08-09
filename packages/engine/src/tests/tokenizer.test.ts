import { expectToken } from './testUtils';

import { Tokenizer } from 'src/tokens';

describe('tokenizer', () => {
  test('generates tokens', () => {
    expect(new Tokenizer(`SET hit = TRUE`).tokenize()).toEqual([
      expectToken('SET', 'SET'),
      expectToken('WORD', 'hit'),
      expectToken('ASSIGN', '='),
      expectToken('BOOLEAN', 'TRUE')
    ]);

    expect(
      new Tokenizer(`IF hit
        foo()`).tokenize()
    ).toEqual([
      expectToken('IF', 'IF'),
      expectToken('WORD', 'hit'),
      expectToken('NEWLINE', ''),
      expectToken('INDENTATION', '        '),
      expectToken('WORD', 'foo'),
      expectToken('LPAREN', '('),
      expectToken('RPAREN', ')')
    ]);
  });
});
