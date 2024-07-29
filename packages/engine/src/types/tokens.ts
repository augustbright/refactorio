import { TOKEN_TYPES } from 'engine/tokenizer';

export type TTokenType = (typeof TOKEN_TYPES)[number]['type'];

export type TToken = {
  type: TTokenType;
  value: string;
};
