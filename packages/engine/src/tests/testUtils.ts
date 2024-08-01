import path from 'path';
import { TestScheduler } from 'rxjs/testing';

export const mockRepoPath = () => {
  return path.join(process.cwd(), 'tests/mock-repo/');
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const testRx = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

export const mockObserver = () => ({
  next: jest.fn(),
  complete: jest.fn(),
  error: jest.fn()
});
