import { TokenWalker } from './TokenWalker';
import { parseProgram } from './parseProgram';

export function parse(code: string) {
  const walker = TokenWalker.from(code);
  return parseProgram(walker);
}
