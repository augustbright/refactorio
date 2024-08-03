import { readFile } from 'fs/promises';

import { createChildContext } from './evaluationContext';
import { transformCode } from './transformCode';
import { TEvaluationContext, TParser, TScriptDefinition } from './types';

type TTransformFileOptions = {
  filename: string;
  script: TScriptDefinition;
  parser: TParser;
  context: TEvaluationContext;
};

type TTransformFileResult = {
  isChanged: boolean;
  code: string;
};

export const transformFile = async ({
  script,
  filename,
  parser,
  context
}: TTransformFileOptions): Promise<TTransformFileResult> => {
  const code = await readFile(filename, 'utf8');

  transformCode({
    code,
    parser,
    context: createChildContext(
      context,
      {
        filename: { value: filename }
      },
      {
        freeze: true
      }
    ),
    script
  });

  // codeOutput.filtered({}).on('data', logger.push);

  return { code, isChanged: false };
  // return codeTransformation$;
};
