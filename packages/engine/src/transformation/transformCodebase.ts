import { GlobOptionsWithFileTypesUnset, glob } from 'glob';
import { Readable } from 'stream';

import { withStreamResult } from '../utils/withStreamResult';
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

export const transformCodebase = withStreamResult(
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
        const { out: fileOut, result } = transformFile({
          script,
          filename,
          parser
        });

        fileOut.on('data', (chunk) => {
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
