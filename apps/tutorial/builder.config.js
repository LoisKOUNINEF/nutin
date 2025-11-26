export default {
	esbuild: {
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: 'browser',
    format: 'esm',
    target: ['es2015'],
    legalComments: 'none',
    loader: {
      '.json': 'json',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
	},
  compression: {
    gzip: true,
  },
  verbose: false,
}