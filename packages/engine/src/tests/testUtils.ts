import path from 'path';

export const mockRepoPath = () => {
  return path.join(process.cwd(), 'tests/mock-repo/');
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface IMockObserver<Value, Error> {
  next: jest.Mock<void, [Value]>;
  complete: jest.Mock<void>;
  error: jest.Mock<void, [Error]>;
}

export class MockObserver<Value, Error = unknown>
  implements IMockObserver<Value, Error>
{
  next: jest.Mock<void, [Value]>;
  complete: jest.Mock<void, []>;
  error: jest.Mock<void, [Error]>;

  constructor(observer: Partial<IMockObserver<Value, Error>> = {}) {
    this.next = observer.next || jest.fn();
    this.complete = observer.complete || jest.fn();
    this.error = observer.error || jest.fn();
  }
}

export const mockObserver = <Value, Error = unknown>(
  observer: Partial<IMockObserver<Value, Error>> = {}
) => new MockObserver(observer);

export const waitUntilCalled = (fn: jest.Mock, timeout: number = 10_000) =>
  new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      if (fn.mock.calls.length > 0) {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        resolve(null);
      }
    }, 50);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error("Function hasn't been called within the allowed time"));
    }, timeout);
  });

export const waitUntilComplete = <Value, Error>(
  observer: MockObserver<Value, Error>
) => waitUntilCalled(observer.complete);
