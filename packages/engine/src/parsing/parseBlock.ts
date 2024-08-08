import { TokenWalker } from './TokenWalker';
import { parseCommonStatement } from './parseCommonStatement';

import { TBlock } from 'src/types';

export function parseBlock(
  walker: TokenWalker,
  blockIndentation: number
): TBlock {
  const body = [];

  while (!walker.done) {
    const token = walker.current;
    if (!token) {
      throw new SyntaxError('Unexpected end of input');
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
    body
  };
}
