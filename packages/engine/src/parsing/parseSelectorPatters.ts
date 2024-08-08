import { TokenWalker } from './TokenWalker';
import { parseExpression } from './parseExpression';

import { TExpression, TSelectorPattern } from 'src/types';

function parsePatternFilter(walker: TokenWalker): TExpression[] {
  walker.assertType('LSB', 'Expected pattern filter');
  const result: TExpression[] = [];
  walker.step();
  while (!walker.is('RSB')) {
    result.push(parseExpression(walker));
    walker.assertType(
      ['COMMA', 'RSB'],
      'Unexpected token found while parsing selector pattern filter'
    );
    walker.skipSingle('COMMA');
  }
  walker.step();

  return result;
}

function parseSelectorPattern(walker: TokenWalker): TSelectorPattern {
  const nodeType = walker.assertType('WORD', 'Expected Selector pattern').value;
  walker.step();

  let filter: TExpression[] | undefined;
  if (walker.is('LSB')) {
    filter = parsePatternFilter(walker);
  }

  return {
    type: 'TSelectorPattern',
    nodeType,
    filter
  };
}

export function parseSelectorPatterns(walker: TokenWalker): TSelectorPattern[] {
  const patterns: TSelectorPattern[] = [];
  while (walker.is('WORD')) {
    const pattern = parseSelectorPattern(walker);
    patterns.push(pattern);
  }

  return patterns;
}
