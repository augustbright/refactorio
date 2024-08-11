import { requireDisclaimer } from './requireDisclaimer.mjs';

/** @type import('eslint').ESLint.Plugin */
export default {
  meta: {
    name: 'eslint-plugin-local-rules',
    version: '1.0.0'
  },
  rules: {
    'require-disclaimer': requireDisclaimer
  }
};
