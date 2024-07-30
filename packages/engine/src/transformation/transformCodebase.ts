import { GlobOptionsWithFileTypesUnset, glob } from 'glob';

import { withStreamLogger } from '../logger/withStreamLogger';
import { transformFile } from './transformFile';
import { TParser, TScriptDefinition } from './types';

type TTransformCodebaseOptions = {
  input: {
    files: string | string[];
    ignore: GlobOptionsWithFileTypesUnset['ignore'];
  };
  parser: TParser;
};

type TTransformCodebaseResult = {
  files: string[];
};

export const transformCodebase = withStreamLogger(
  async (
    logger,
    script: TScriptDefinition,
    { input, parser }: TTransformCodebaseOptions
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
        const { output: fileOutput, result } = transformFile({
          script,
          filename,
          parser
        });

        fileOutput.filtered({}).on('data', logger.push);

        const { code, isChanged } = await result;
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
