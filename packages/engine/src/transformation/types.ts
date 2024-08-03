import { Options as RecastOptions } from 'recast';
import { Tagged, UnknownRecord } from 'type-fest';

import { TProgram } from 'src/types';

export type TParser = RecastOptions['parser'];
export type TEvaluationContext = Tagged<UnknownRecord, 'evaluation context'>;
export type TScriptDefinition = TProgram | string;
