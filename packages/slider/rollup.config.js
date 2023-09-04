import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/input-range.js',
      format: 'esm',
    },
    plugins: [typescript()],
  },
];
