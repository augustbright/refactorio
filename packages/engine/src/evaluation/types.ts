import { Options as RecastOptions } from 'recast';
import { Tagged } from 'type-fest';

import { TCommonNode, TProgram } from 'src/types';

export type TParser = RecastOptions['parser'];
export type TEvaluationContext = Tagged<
  {
    [key: string | symbol]: unknown;
  },
  'evaluation context'
>;
export type TScriptDefinition = TProgram | string;

// TODO pass location
export type TEvaluationPoint = {
  breakpoint?: boolean;
  stepOut?: boolean;
  step?: boolean;
  node?: TCommonNode;
};
export type TEvaluationYieldResponse =
  | 'run'
  | 'step'
  | 'step into'
  | 'step out';

export type TEvaluator = Generator<
  TEvaluationPoint,
  unknown,
  TEvaluationYieldResponse
>;
