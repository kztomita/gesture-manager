import babel from 'rollup-plugin-babel';
import banner from './scripts/banner.js';

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'GestureManager',      // namespace
    sourcemap: true,
    file: 'build/gesture-manager.js',
    banner: banner
  },
  plugins: [
    babel(
      {
        "presets": [
          ["@babel/preset-env", {
            "modules": false
          }]
        ],
        "exclude": 'node_modules/**',
      }
    )
  ]
};
