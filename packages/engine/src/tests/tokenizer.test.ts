import { Tokenizer } from 'src/tokens';

describe('tokenizer', () => {
  test('generates tokens', () => {
    expect(new Tokenizer(`SET hit = TRUE`).tokenize()).toEqual([
      { type: 'SET', value: 'SET' },
      { type: 'IDENTIFIER', value: 'hit' },
      { type: 'ASSIGN', value: '=' },
      { type: 'BOOLEAN', value: 'TRUE' }
    ]);

    expect(
      new Tokenizer(`IF hit
        foo()`).tokenize()
    ).toEqual([
      { type: 'IF', value: 'IF' },
      { type: 'IDENTIFIER', value: 'hit' },
      { type: 'NEWLINE', value: '' },
      { type: 'INDENTATION', value: '        ' },
      { type: 'IDENTIFIER', value: 'foo' },
      { type: 'LPAREN', value: '(' },
      { type: 'RPAREN', value: ')' }
    ]);
  });
});
