import { TokenWalker } from './TokenWalker';
import { parseCommonStatement } from './parseCommonStatement';

import { TStatement } from 'src/types';

export function parseRootStatement(walker: TokenWalker): TStatement {
  // FIXME remove this or use it
  // if (walker.is('INDENTATION')) throw new SyntaxError('Unexpected indentation');

  return parseCommonStatement(walker);
}
