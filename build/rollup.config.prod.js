import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'

export default {
  entry: './src/index.js',
  dest: './dist/vue-touch.js',
  // Module settings
  format: 'umd',
  external: ['hammerjs'],
  globals: {
    hammerjs: 'Hammer'
  },
  moduleName: 'VueTouch',

  plugins: [
    babel(),
    nodeResolve({ jsnext: true, main: true }),
    commonjs(),
    cleanup()
  ]
}
