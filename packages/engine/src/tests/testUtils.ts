import path from 'path';

export const mockRepoPath = () => {
  return path.join(process.cwd(), 'tests/mock-repo/');
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
