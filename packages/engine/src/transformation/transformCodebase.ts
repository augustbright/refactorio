import { GlobOptionsWithFileTypesUnset, glob } from 'glob';

import { withStreamLogger } from '../logger/withStreamLogger';
import { createChildContext } from './evaluationContext';
import { transformFile } from './transformFile';
import { TEvaluationContext, TParser, TScriptDefinition } from './types';

type TTransformCodebaseOptions = {
  input: {
    files: string | string[];
    ignore: GlobOptionsWithFileTypesUnset['ignore'];
  };
  context: TEvaluationContext;
  parser: TParser;
};

type TTransformCodebaseResult = {
  files: string[];
};

export const transformCodebase = withStreamLogger(
  async (
    logger,
    script: TScriptDefinition,
    { input, parser, context }: TTransformCodebaseOptions
  ): Promise<TTransformCodebaseResult> => {
    const files = await glob(input.files, {
      ignore: input.ignore,
      absolute: true
    });
    const codebaseResult: TTransformCodebaseResult = {
      files: []
    };

    for (const filename of files) {
      try {
        const fileResult = await transformFile({
          script,
          filename,
          parser,
          context: createChildContext(
            context,
            {},
            {
              freeze: true
            }
          )
        });

        const { code, isChanged } = await fileResult;
        if (isChanged) {
          logger.debug(code);
          // await writeFile(file, transformed.content);
        }
      } catch (e) {
        logger.error(`Error transforming ${filename}: ${e}`);
      }
      codebaseResult.files.push(filename);
    }

    return codebaseResult;
  }
);
