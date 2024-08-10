/* eslint-disable no-console */
import { TEvaluationPoint } from '../types';

import { extractLocation } from 'src/utils/location/extractLocation';
import { highlight } from 'src/utils/location/highlight';

export const visualizeEvaluationPoint = (
  code: string,
  iteratorResult: IteratorResult<TEvaluationPoint, unknown>
) => {
  if (!iteratorResult.done) {
    const location = iteratorResult.value.node?.loc;
    if (location) {
      console.log(highlight(extractLocation(code, location)));
    } else {
      console.log('No location');
    }
  } else {
    console.log('Done');
  }

  return iteratorResult;
};
