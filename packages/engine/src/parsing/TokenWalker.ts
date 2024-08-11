import { ErrorManager } from 'src/errors';
import { TToken, TTokenType, Tokenizer } from 'src/tokens';
import { EMPTY_LOCATION } from 'src/utils/location/emptyLocation';

const ensureArray = <T>(value: T | T[]): T[] =>
  Array.isArray(value) ? value : [value];

export class TokenWalker {
  private currentPosition = 0;
  indentation = 0;
  private constructor(
    private tokens: TToken[],
    private code: string
  ) {}

  step(steps = 1): TToken | undefined {
    return this.tokens[(this.currentPosition += steps)];
  }

  is(tokenType: TTokenType | TTokenType[], steps = 0) {
    const atPosition = this.currentPosition + steps;
    const skipSteps = 0;

    const token = this.tokens[atPosition + skipSteps];
    return token && ensureArray(tokenType).includes(token.type);
  }

  isIntended(indentation: number, tokenType: TTokenType | TTokenType[]) {
    if (!indentation) return this.is(tokenType);
    if (
      this.is('INDENTATION') &&
      this.currentValue?.length === indentation &&
      this.is(tokenType, 1)
    ) {
      this.step();
      return true;
    }
    return false;
  }

  skip(
    tokenType: TTokenType | TTokenType[],
    ifBefore?: TTokenType | TTokenType[]
  ) {
    let lookahead = 0;
    if (ifBefore) {
      while (this.is(tokenType, lookahead)) lookahead++;
      if (!this.is(ifBefore, lookahead)) return;
    }

    let token: TToken | undefined;
    while (this.is(tokenType)) token = this.step();
    return token;
  }

  skipSingle(tokenType: TTokenType | TTokenType[]) {
    if (this.is(tokenType)) this.step();
  }

  assertType(tokenType: TTokenType | TTokenType[], errorMessage: string) {
    const matches = ensureArray(tokenType).some((token) => this.is(token));

    if (!matches) {
      // throw new SyntaxError(`${errorMessage}, got: "${this.current?.value}"`);
      return ErrorManager.throw(
        new SyntaxError(`${errorMessage}, got: "${this.current?.value}"`),
        this.currentLoc ?? EMPTY_LOCATION
      );
    }

    return this.current!;
  }

  get current(): TToken | undefined {
    return this.tokens[this.currentPosition];
  }
  get currentType(): TTokenType | undefined {
    return this.current?.type;
  }
  get currentValue(): TToken['value'] | undefined {
    return this.current?.value;
  }
  get currentLoc() {
    return this.current?.loc;
  }
  currentPlus(steps: number) {
    return this.tokens[this.currentPosition + steps];
  }

  get done() {
    return this.currentPosition >= this.tokens.length;
  }

  static from(code: string) {
    return new TokenWalker(new Tokenizer(code).tokenize(), code);
  }
}
