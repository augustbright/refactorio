import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^engine/(.*)$': '<rootDir>/packages/engine/src/$1',
  }
};
export default config;
