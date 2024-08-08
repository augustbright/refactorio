import { Tokenizer } from 'src/tokens';

describe('tokenizer', () => {
  test('generates tokens', () => {
    expect(new Tokenizer(`SET hit = TRUE`).tokenize()).toEqual([
      { type: 'SET', value: 'SET' },
      { type: 'WORD', value: 'hit' },
      { type: 'ASSIGN', value: '=' },
      { type: 'BOOLEAN', value: 'TRUE' }
    ]);

    expect(
      new Tokenizer(`IF hit
        foo()`).tokenize()
    ).toEqual([
      { type: 'IF', value: 'IF' },
      { type: 'WORD', value: 'hit' },
      { type: 'NEWLINE', value: '' },
      { type: 'INDENTATION', value: '        ' },
      { type: 'WORD', value: 'foo' },
      { type: 'LPAREN', value: '(' },
      { type: 'RPAREN', value: ')' }
    ]);
  });
});
