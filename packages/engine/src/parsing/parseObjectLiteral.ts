import { TokenWalker } from './TokenWalker';
import { parseExpression } from './parseExpression';

import { TObjectLiteral } from 'src/types';

export function parseObjectLiteral(walker: TokenWalker): TObjectLiteral {
  walker.assertType('LCB', 'Expected object literal, but got unexpected token');
  walker.step();
  const map: TObjectLiteral['map'] = {};

  while (!walker.is('RCB')) {
    const key = walker.assertType(
      'WORD',
      'Expected object literal, but got unexpected token'
    ).value;

    walker.step();

    walker.assertType('COLON', 'Expected ":", but got');
    walker.step();

    const expression = parseExpression(walker);
    walker.assertType(
      ['COMMA', 'RCB'],
      'Unexpected token found while parsing object literal'
    );
    walker.skipSingle('COMMA');
    map[key] = expression;
  }
  walker.step();

  return {
    type: 'ObjectLiteral',
    map
  };
}
