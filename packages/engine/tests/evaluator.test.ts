import { evaluate } from 'engine/evaluator';
import { parse } from 'engine/parser';
import { tokenize } from 'engine/tokenizer';
import * as parser from 'recast/parsers/babel-ts.js';

import { mockRepoPath } from './testUtils';

describe('evaluator', () => {
  test('iterates through a list of files by pattern', async () => {
    const { files, stdout } = await evaluate(
      parse(tokenize(`print(context.filename + ': hello world!')`)),
      {
        input: {
          files: ['**/*.tsx', '**/*.ts', '**/*.js', '**/*.jsx'],
          options: {
            ignore: ['node_modules/**', 'build/**'],
            cwd: mockRepoPath()
          }
        },
        parser
      }
    );

    for await (const chunk of stdout) {
      console.log(chunk.toString());
    }

    console.log(files);
  });
});
