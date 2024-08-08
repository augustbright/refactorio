import { TokenWalker } from './TokenWalker';
import { parseBlock } from './parseBlock';
import { parseCommonStatement } from './parseCommonStatement';

import { TStatement } from 'src/types';

export function parseStatement(walker: TokenWalker): TStatement {
  if (walker.is('NEWLINE')) {
    walker.step();
    const indentationToken = walker.assertType(
      'INDENTATION',
      'Expected indentation'
    );
    if (indentationToken.value.length <= walker.indentation) {
      throw new SyntaxError('Broken indentation');
    }
    walker.indentation = indentationToken.value.length;
    return parseBlock(walker, walker.indentation);
  }

  return parseCommonStatement(walker);
}
