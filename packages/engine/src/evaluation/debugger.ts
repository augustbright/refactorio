import { isDebugging, isSuspended, setSuspended } from './evaluationContext';
import {
  TEvaluationContext,
  TEvaluationYieldResponse,
  TEvaluator
} from './types';

import { ErrorManager } from 'src/errors';
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
      // return yield* evaluator;
    } else if (response === 'step out') {
      yield { stepOut: true };
    } else if (!response || response === 'run') {
      setSuspended(context, false);
    } else {
      return ErrorManager.throw(new UnreachableCaseError(response), node.loc);
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
    // TODO test this case
    if (value.breakpoint && isDebugging(context)) {
      setSuspended(context, true);
      return yield* step(context, node, evaluator);
    }
  }
}
function stepInto(
  context: TEvaluationContext,
  node: TCommonNode,
  evaluator: TEvaluator
) {
  const iterator = {
    next: (response: TEvaluationYieldResponse) => {
      const result = evaluator.next(response);
      if (result.done) {
        return result;
      }
      if (result.value.stepOut) {
        while (true) {
          const { value, done } = evaluator.next('step');
          if (done) {
            return { value, done };
          }
          if (value.step) {
            continue;
          }
          // TODO test this case
          if (value.breakpoint && isDebugging(context)) {
            setSuspended(context, true);
            return { value, done };
          }
        }
      }
      return result;
    },
    return: (value: unknown) => evaluator.return(value),
    throw: (error: Error) => evaluator.throw(error)
  };

  return {
    [Symbol.iterator]() {
      return iterator;
    }
  };
  // return yield* evaluator;

  // while (true) {
  //   const { value, done } = evaluator.next('step');
  //   if (done) {
  //     return value;
  //   }
  //   if (value.stepOut) {
  //     return yield* stepOver(context, node, evaluator);
  //   }
  //   yield value;
  // }
}
