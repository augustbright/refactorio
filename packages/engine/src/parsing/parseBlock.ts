import { TokenWalker } from './TokenWalker';
import { parseCommonStatement } from './parseCommonStatement';

import { ErrorManager } from 'src/errors';
import { TBlock } from 'src/types';
import { EMPTY_LOCATION } from 'src/utils/location/emptyLocation';

export function parseBlock(
  walker: TokenWalker,
  blockIndentation: number
): TBlock {
  const body = [];

  while (!walker.done) {
    const token = walker.current;
    if (!token) {
      // throw new SyntaxError('Unexpected end of input');
      return ErrorManager.throw(
        new SyntaxError('Unexpected end of input'),
        walker.currentPlus(-1).loc || EMPTY_LOCATION
      );
    }
    if (!walker.is('INDENTATION')) {
      walker.indentation = 0;
      break;
    }
    if (token.value.length < blockIndentation) {
      walker.indentation = token.value.length;
      break;
    }
    walker.step();

    do {
      body.push(parseCommonStatement(walker));
    } while (
      !walker.done &&
      walker.indentation >= blockIndentation &&
      !walker.is(['INDENTATION', 'NEWLINE'])
    );

    walker.skip('NEWLINE');
  }

  return {
    type: 'Block',
    body,
    loc: {
      start: body[0]?.loc.start,
      end: body[body.length - 1]?.loc.end,
      column: blockIndentation,
      line: body[0]?.loc.line
    }
  };
}
