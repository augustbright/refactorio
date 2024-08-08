import { Tokenizer } from '../tokens';
import { TokenWalker } from './TokenWalker';
import { parseProgram } from './parseProgram';

export function parse(code: string) {
  const tokens = new Tokenizer(code).tokenize();
  const walker = new TokenWalker(tokens);

  return parseProgram(walker);
}
