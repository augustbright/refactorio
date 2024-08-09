import { TokenWalker } from './TokenWalker';
import { parseBlock } from './parseBlock';
import { parseCommonStatement } from './parseCommonStatement';

import { ErrorManager } from 'src/errors';
import { TStatement } from 'src/types';

export function parseStatement(walker: TokenWalker): TStatement {
  if (walker.is('NEWLINE')) {
    walker.step();
    const indentationToken = walker.assertType(
      'INDENTATION',
      'Expected indentation'
    );
    if (indentationToken.value.length <= walker.indentation) {
      return ErrorManager.throw(
        new SyntaxError('Broken indentation'),
        indentationToken.loc
      );
    }
    walker.indentation = indentationToken.value.length;
    return parseBlock(walker, walker.indentation);
  }

  return parseCommonStatement(walker);
}
