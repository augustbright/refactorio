import shared from '@refactorio/config/jest.config.mjs';

/** @type import('@jest/types').Config.InitialOptions */
export default {
  ...shared,
  setupFilesAfterEnv: ['./src/setupTests/index.ts']
};
