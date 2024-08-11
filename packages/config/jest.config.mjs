/** @type import('@jest/types').Config.InitialOptions */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.mjs$': 'babel-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/../config/setupTests.ts']
};
