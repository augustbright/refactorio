import { TokenWalker } from './TokenWalker';
import { parseRootStatement } from './parseRootStatement';

import { TProgram } from 'src/types';

export function parseProgram(walker: TokenWalker): TProgram {
  const body = [];

  while (true) {
    walker.skip('NEWLINE');
    if (walker.done) break;
    body.push(parseRootStatement(walker));
  }

  const result: TProgram = {
    type: 'Program',
    body
  };

  return result;
}
