import { TOKEN_TYPES } from './TOKEN_TYPES';
import { TToken } from './types';

import { ErrorManager } from 'src/errors';

export class Tokenizer {
  constructor(private input: string) {}

  public tokenize(): TToken[] {
    const tokens: TToken[] = [];

    let line = 1;
    let start = 0;
    let column = 0;
    let lineStart = true;

    while (this.input.length > 0) {
      let matched = false;
      for (const tokenType of TOKEN_TYPES) {
        const match = this.input.match(tokenType.regex);
        if (match) {
          switch (tokenType.type) {
            case 'COMMENT':
              column += match[0].length;
              start += match[0].length;
              break;
            case 'NEWLINE':
              tokens.push({
                type: tokenType.type,
                value: '',
                loc: { start, end: start, line, column }
              });

              lineStart = true;
              line++;
              column = 0;
              start += match[0].length;

              break;
            case 'INDENTATION':
              if (lineStart) {
                tokens.push({
                  type: 'INDENTATION',
                  value: match[0],
                  loc: { start, end: start + match[0].length, line, column }
                });
                lineStart = false;
              }
              column += match[0].length;
              start += match[0].length;

              break;
            case 'DOT':
              tokens.push({
                type: tokenType.type,
                value: match[1],
                loc: { start, end: start + match[0].length, line, column }
              });
              lineStart = false;
              column += match[0].length;
              start += match[0].length;
              break;
            default:
              tokens.push({
                type: tokenType.type,
                value: match[0],
                loc: { start, end: start + match[0].length, line, column }
              });
              lineStart = false;
              column += match[0].length;
              start += match[0].length;
          }

          this.input = this.input.slice(match[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        return ErrorManager.throw(
          new Error(`Unexpected token: ${this.input[0]}`),
          { start, end: start, line, column }
        );
      }
    }
    return tokens;
  }
}
