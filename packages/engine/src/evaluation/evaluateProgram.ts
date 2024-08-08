import { evaluateStatement } from './evaluateStatement';
import { TEvaluationContext, TEvaluator } from './types';

import { TProgram } from 'src/types';

export function* evaluateProgram(
  context: TEvaluationContext,
  program: TProgram
): TEvaluator {
  for (const statement of program.body) {
    yield* evaluateStatement(context, statement);
  }

  return;
}
