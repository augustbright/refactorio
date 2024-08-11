/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-return */
import { TTokenType } from 'src/tokens';

export const expectLocation = () =>
  expect.objectContaining({
    start: expect.toBeNumber(),
    end: expect.toBeNumber(),
    line: expect.toBeNumber(),
    column: expect.toBeNumber()
  });

export const expectToken = (type: TTokenType, value: string) =>
  expect.objectContaining({
    type,
    value,
    loc: expectLocation()
  });
