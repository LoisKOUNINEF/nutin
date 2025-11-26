export default {
	origins: [
		'src/app', // actual app code
		'src/core', // toolkit core logic
		'src/libs', // built-in libs
		'testin-nutin/core/tests', // test globals
	],
	jsdomOptions: {
    runScripts: false,     // or true ("dangerously") if needed
    resources: false,      // or true ("usable") if needed
    freezeGlobals: false,
    pretendToBeVisual: true,
  },
	verbose: false,
}