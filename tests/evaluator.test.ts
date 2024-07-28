import * as parser from 'recast/parsers/babel-ts.js';

import { mockRepoPath } from './testUtils';

import { evaluate } from 'src/evaluator';
import { parse } from 'src/parser';
import { tokenize } from 'src/tokenizer';

describe('evaluator', () => {
  test('iterates through a list of files by pattern', async () => {
    const { files } = await evaluate(parse(tokenize(`print('hello world!')`)), {
      input: {
        files: ['**/*.tsx', '**/*.ts', '**/*.js', '**/*.jsx'],
        options: {
          ignore: ['node_modules/**', 'build/**'],
          cwd: mockRepoPath()
        }
      },
      parser
    });

    console.log(files);
  });
});
