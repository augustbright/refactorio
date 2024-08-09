import { isDebugging, isSuspended, setSuspended } from './evaluationContext';
import { TEvaluationContext, TEvaluator } from './types';

import { TCommonNode } from 'src/types';
import { UnreachableCaseError } from 'src/utils/UnreachableCaseError';

export function* step(
  context: TEvaluationContext,
  node: TCommonNode,
  evaluator: TEvaluator
): TEvaluator {
  if (isDebugging(context) && isSuspended(context)) {
    const response = yield {
      step: true,
      node
    };
    if (response === 'step') {
      return yield* stepOver(context, node, evaluator);
    } else if (response === 'step into') {
      return yield* stepInto(context, node, evaluator);
    } else if (response === 'step out') {
      yield { stepOut: true };
    } else if (!response || response === 'run') {
      setSuspended(context, false);
    } else {
      throw new UnreachableCaseError(response);
    }
  }
  return yield* stepOver(context, node, evaluator);
}

function* stepOver(
  context: TEvaluationContext,
  node: TCommonNode,
  evaluator: TEvaluator
): TEvaluator {
  while (true) {
    const { value, done } = evaluator.next('step');
    if (done) {
      return value;
    }
    if (value.step) {
      continue;
    }
    if (value.breakpoint) {
      if (isDebugging(context)) {
        setSuspended(context, true);
        return yield* step(context, node, evaluator);
      }
    }
  }
}
function* stepInto(
  context: TEvaluationContext,
  node: TCommonNode,
  evaluator: TEvaluator
): TEvaluator {
  while (true) {
    const { value, done } = evaluator.next();
    if (done) {
      return value;
    }
    if (value.stepOut) {
      return yield* stepOver(context, node, evaluator);
    }
  }
}
