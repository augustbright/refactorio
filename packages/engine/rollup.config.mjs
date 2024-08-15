import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions } */
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  plugins: [typescript()]
};
