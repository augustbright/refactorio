import { TokenWalker } from './TokenWalker';
import { parseRootStatement } from './parseRootStatement';

import { TLocation, TProgram } from 'src/types';

export function parseProgram(walker: TokenWalker): TProgram {
  const body = [];

  while (true) {
    walker.skip('NEWLINE');
    if (walker.done) break;
    body.push(parseRootStatement(walker));
  }

  const loc: TLocation =
    body.length === 0
      ? {
          start: 0,
          end: 0,
          column: 0,
          line: 0
        }
      : {
          start: body[0].loc.start,
          end: body[body.length - 1].loc.end,
          column: body[0].loc.column,
          line: body[0].loc.line
        };

  const result: TProgram = {
    type: 'Program',
    body,
    loc
  };

  return result;
}
