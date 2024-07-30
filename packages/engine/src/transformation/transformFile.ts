import { readFile } from 'fs/promises';

import { withStreamLogger } from '../logger/withStreamLogger';
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

export const transformFile = withStreamLogger(
  async (
    logger,
    { script, filename, parser }: TTransformFileOptions
  ): Promise<TTransformFileResult> => {
    const code = await readFile(filename, 'utf8');

    const { logger: codeLogger, result } = transformCode({
      code,
      parser,
      globalContext: {
        filename
      },
      script
    });

    codeLogger.on('data', (chunk) => {
      logger.push(chunk);
    });

    return result;
  }
);
