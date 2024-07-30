import { GlobOptionsWithFileTypesUnset, glob } from 'glob';
import { Readable } from 'stream';

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
  out: Readable;
};

export const transformCodebase = withStreamLogger(
  async (
    out: Readable,
    script: TScriptDefinition,
    { input, parser }: TTransformCodebaseOptions
  ): Promise<TTransformCodebaseResult> => {
    const files = await glob(input.files, {
      ignore: input.ignore,
      absolute: true
    });
    const codebaseResult: TTransformCodebaseResult = {
      files: [],
      out
    };

    for (const filename of files) {
      try {
        const { logger: fileLogger, result } = transformFile({
          script,
          filename,
          parser
        });

        fileLogger.on('data', (chunk) => {
          out.push(chunk);
        });

        const { code, isChanged } = await result;
        if (isChanged) {
          // TODO implement a decent logger
          out.push(code);
          // await writeFile(file, transformed.content);
        }
      } catch (e) {
        console.error(`Error transforming ${filename}: ${e}`);
      }
      codebaseResult.files.push(filename);
    }

    return codebaseResult;
  }
);
