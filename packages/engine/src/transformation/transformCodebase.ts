import { GlobOptionsWithFileTypesUnset, glob } from 'glob';

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

export const transformCodebase = async (
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
        // TODO Logger
        // logger.debug(code);
        // await writeFile(file, transformed.content);
      }
    } catch (e) {
      // TODO Logger
      // logger.error(`Error transforming ${filename}: ${e}`);
    }
    codebaseResult.files.push(filename);
  }

  return codebaseResult;
};
