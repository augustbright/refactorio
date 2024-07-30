import * as parser from 'recast/parsers/babel-ts.js';

import { mockRepoPath } from './testUtils';

import { evaluate } from 'src/evaluator';
import { parse } from 'src/parser';

describe('evaluator', () => {
  test('iterates through a list of files by pattern', async () => {
    const { files, stdout } = await evaluate(
      parse(`print(context.filename + ': hello world!')`),
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
