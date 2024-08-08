import { isDebugging, isSuspended } from './evaluationContext';
import { TEvaluationContext, TEvaluator } from './types';

export function* step(
  context: TEvaluationContext,
  evaluator: TEvaluator
): TEvaluator {
  if (
    isDebugging(context) &&
    isSuspended(context) &&
    (yield {}) === 'step into'
  ) {
    return yield* stepInto(evaluator);
  }
  return yield* stepOver(evaluator);
}

function* stepOver(evaluator: TEvaluator): TEvaluator {
  while (true) {
    const { value, done } = evaluator.next();
    if (done) {
      return value;
    }
    if (value.breakpoint) {
      yield value;
    }
  }
}
function* stepInto(evaluator: TEvaluator): TEvaluator {
  return yield* evaluator;
}
