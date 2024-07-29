import { tokenize } from 'engine/tokenizer';

describe('tokenizer', () => {
  test('generates tokens', () => {
    expect(tokenize(`SET hit = TRUE`)).toEqual([
      { type: 'SET', value: 'SET' },
      { type: 'IDENTIFIER', value: 'hit' },
      { type: 'ASSIGN', value: '=' },
      { type: 'BOOLEAN', value: 'TRUE' }
    ]);

    expect(
      tokenize(`IF hit
        foo()`)
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
