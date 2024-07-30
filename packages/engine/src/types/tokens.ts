import { TOKEN_TYPES } from 'src/tokenizer';

export type TTokenType = (typeof TOKEN_TYPES)[number]['type'];

export type TToken = {
  type: TTokenType;
  value: string;
};
