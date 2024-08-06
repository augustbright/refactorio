import { TToken, TTokenType } from 'src/tokens';

const ensureArray = <T>(value: T | T[]): T[] =>
  Array.isArray(value) ? value : [value];

export class TTokenWalker {
  private currentPosition = 0;
  constructor(private tokens: TToken[]) {}

  step(steps = 1): TToken | undefined {
    return this.tokens[(this.currentPosition += steps)];
  }

  is(tokenType: TTokenType | TTokenType[], steps = 0) {
    const atPosition = this.currentPosition + steps;
    const skipSteps = 0;

    const token = this.tokens[atPosition + skipSteps];
    return token && ensureArray(tokenType).includes(token.type);
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
      throw new SyntaxError(`${errorMessage}, got: "${this.current?.value}"`);
    }

    return this.current as TToken;
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
  currentPlus(steps: number) {
    return this.tokens[this.currentPosition + steps];
  }

  get done() {
    return this.currentPosition >= this.tokens.length;
  }
}
