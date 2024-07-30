import { readFile } from 'fs/promises';

import { withStreamResult } from '../utils/withStreamResult';
import { transformCode } from './transformCode';
import { TParser, TScriptDefinition } from './types';

type TTransformFileOptions = {
  filename: string;
  script: TScriptDefinition;
  parser: TParser;
};

type TTransformFileResult = {
  isChanged: boolean;
  code: string;
};

export const transformFile = withStreamResult(
  async (
    out,
    { script, filename, parser }: TTransformFileOptions
  ): Promise<TTransformFileResult> => {
    const code = await readFile(filename, 'utf8');

    const { out: codeOut, result } = transformCode({
      code,
      parser,
      globalContext: {
        filename
      },
      script
    });

    codeOut.on('data', (chunk) => {
      out.push(chunk);
    });

    return result;
  }
);
