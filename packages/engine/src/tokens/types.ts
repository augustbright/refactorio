import {
  BINARY_EXPRESSION_OPERATORS_TOKEN_TYPES,
  EXPRESSION_OPERATORS_TOKEN_TYPES,
  TOKEN_TYPES
} from './TOKEN_TYPES';

import { TLocation } from 'src/types';

export type TBinaryExpressionOperatorTokenType =
  (typeof BINARY_EXPRESSION_OPERATORS_TOKEN_TYPES)[number]['type'];

export type TExpressionOperatorTokenType =
  (typeof EXPRESSION_OPERATORS_TOKEN_TYPES)[number]['type'];

export type TTokenType = (typeof TOKEN_TYPES)[number]['type'];

export type TToken<Type = TTokenType> = {
  type: Type;
  value: string;
  loc: TLocation;
};
