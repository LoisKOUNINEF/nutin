# testin-nutin Docs

***The test runner uses a Queue data structure, for which all credit goes to               ThePrimeagen and his [amazing Data Structures and Algorithms course on frontendmasters.com](https://frontendmasters.com/courses/algorithms/)*** 

## Run tests

The code needs to be compiled for the tests to run.

```sh
npm run test
npm run test:watch # NOTE: will rerun all tests on change.
npm run test--rebuild # = npm run build && npm run test 
``` 
Accepts a filter argument *ex: e2e, unit, FILE_NAME*.     

## Built-in features (minimalistic)

- *Test globals* : describe, it, beforeEach/All, afterEach/All.

- *Assertions library* : `toBe`, `toEqual`, `toContain`, `toBeDefined`, `toBeUndefined`, `toBeInstanceOf`, `toHaveBeenCalled`, `toHaveBeencalledWith`, `toBeLessThan`, `ToBeGreaterThan`.                
All assertions can be used with their `not.` counterpart.

```js
expect(2+2).toBe(4);
expect(2+2).not.toBe(5);
```

- *spyOn* 

```js 
spyOn = (obj, methodName) => { return calls }
```

- *JSDOM initial setup for DOM testing*.

- *HTTP client mock* (In progress)

- *Automated tests discovery* : Recursively scans e2e/ unit/ and utils/ folders for .test.js files.                              
                             
- Add new paths in `test/runner.js` `testFiles` array (`...getTestFiles('path/to/folder')`) or remove one to disable its tests.                    
Uncomment related `getTestFiles` to test nutin's core logic and libs.

- *mini-chalk* to color console outputs.

## How to use

Syntax is very similar to Jest, only with (way) less features.               
Import statements from 'dist' folder can be simplified by using `#root/dist/src` and by regrouping exports in indexes.                   
Please refer to examples in utils/\*.test.js and unit/i18n.test.js.

## Quick orientation

* Testing toolkit requires the TypeScript code to be compiled first. `"imports": {"#root/*.js": "./*.js"}` is meant to be used in test files only, to shorten long relative paths.
* Runner exposes global helpers: `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll`.
* Runs in **Node + jsdom** to provide a browser-like DOM environment without a full browser.
* Built-in `spyOn` utility.
* CLI: `npm run test` (runs single-run), `npm run test:watch` (watch mode) and `npm run test--rebuild` (builds and runs single-run).


## File structure & discovery

* Test runner searches `**/*.test.js` by default.
* Example structure:

```
src/
  components/
    user-card.ts
    user-card.test.ts
test/
  helpers/
    dom-fixtures.test.js
```


## Basic syntax (describe / it / expect)

```js
describe('sum()', () => {
  it('adds two numbers', () => {
    const res = sum(1, 2);
    expect(res).toBe(3);
  });
});
```

* `describe(name, fn)` groups tests.
* `it(name, fn)` / `test(name, fn)` defines a test case.
* `expect(value)` returns a matcher object: `toBe`, `toEqual`, `toContain`, `toBeDefined`, `toBeUndefined`, `toBeInstanceOf`, `toHaveBeenCalled`, `toHaveBeencalledWith`, `toBeLessThan`, `ToBeGreaterThan`.
* matcher objects all have a `not` counterpart (`expect(value).not.toBe('not-expected')`).
* extend matcher in `test/core/src/assertion-lib.js`.

## JSDOM

```ts
setupJsdomEnvironment(htmlPath = 'dist/src/index.html') {
  const html = fs.readFileSync(path.resolve(process.cwd(), htmlPath), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost' });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
}
```

## Where to look in code

* `test/core/src/globals/` - assertion library, globals, spyOn.
* `test/core/src/utils/` - queue class, test-discovery, test-queue, print (chalk-like util)
* `test/core/tests` - testing assertions and globals.
* `test/runner.js` - paths registrations.
