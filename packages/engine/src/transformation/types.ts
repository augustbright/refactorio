import { Options as RecastOptions } from 'recast';
import { Readable } from 'stream';

import { TProgram } from 'src/types';

export type TParser = RecastOptions['parser'];
export type TGlobalContext = Record<string, unknown>;
export type TScriptDefinition = TProgram | string;

export type TWithStream<Result> = {
  out: Readable;
  result: Result;
};
