import { TOKEN_TYPES } from './TOKEN_TYPES';

export type TTokenType = (typeof TOKEN_TYPES)[number]['type'];

export type TToken<Type = TTokenType> = {
  type: Type;
  value: string;
};
