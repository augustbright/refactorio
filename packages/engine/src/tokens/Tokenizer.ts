import { TOKEN_TYPES } from './TOKEN_TYPES';
import { TToken } from './types';

export class Tokenizer {
  constructor(private input: string) {}

  public tokenize(): TToken[] {
    const tokens: TToken[] = [];

    let lineStart = true;
    while (this.input.length > 0) {
      let matched = false;
      for (const tokenType of TOKEN_TYPES) {
        const match = this.input.match(tokenType.regex);
        if (match) {
          switch (tokenType.type) {
            case 'COMMENT':
              break;
            case 'NEWLINE':
              tokens.push({ type: tokenType.type, value: '' });
              lineStart = true;
              break;
            case 'INDENTATION':
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

          this.input = this.input.slice(match[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        throw new Error(`Unexpected token: ${this.input[0]}`);
      }
    }
    return tokens;
  }
}
