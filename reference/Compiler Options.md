# Compiler Options

TypeScript has a wide array of configuration options.
This page is organized by theme, and within each theme the options are roughly sorted in order of how often they're likely to be used.

__toc__

## Code Emit Options

### `target`

**Allowed Values**: `ES3` (default), `ES5`, `ES6`/`ES2015` (synonomous), `ES2016`, `ES2017`, `ES2018`, `ES2019`, `ESNext`

All modern browsers support all ES6 features, so `ES6` is a good choice.
You might choose to set a lower target if your code is deployed to older environments, or a higher target if your code only runs on newer environments.

The `target` setting changes which JS features are downleveled or left intact.
For example, an arrow function `() => this` will be turned into an equivalent `function` expression if `target` is ES5 or lower.

`target` also changes the default value of [[`lib`]].
You may "mix and match" `target` and `lib` settings as desired.

### `module`

**Allowed Values**: `CommonJS` (default if `target` is `ES3` or `ES5`), `ES6`/`ES2015` (synonymous, default for `target` `ES6` and higher), `None`, `UMD`, `AMD`, `System`, `ESNext`

Sets the module system for the program. See the [[Modules]] chapter for more information.

### `jsx`

**Allowed Values**: `react` (default), `react-native`, `preserve`

Controls how JSX constructs are emitted in JavaScript files.
This only affects output of JS files that started in `.tsx` files.

 * `preserve`: Emit `.jsx` files with the JSX unchanged
 * `react`: Emit `.js` files with JSX changed to the equivalent `React.createElement` calls
 * `react-native`: Emit `.js` files with the JSX unchanged

### `jsxFactory`

**Allowed Values**: Any identifier or dotted identifier; default `"React.createElement"`

Changes the function called in `.js` files when compiling JSX Elements.
The most common change is to use `"h"` or `"preact.h"` instead of the default `"React.createElement"` if using `preact`.

This is the same as Babel's `/** @jsx h */` directive.

### `declaration`

**Default**: `false`

Enables automation generation of `.d.ts` files from `.ts` inputs

### `declarationDir`

**Allowed Values**: Directory path. Defaults to the same location as `outDir`

Emits declaration files to a different directory.

### `declarationMap`

**Default**: `false`

Generates a source map for `.d.ts` files that maps back to the original `.ts` source file.
This will allow editors such as VS Code to go to the original `.ts` file when using features like *Go to Definition*.
You should strongly consider turning this on if you're using project references.

### `emitDeclarationOnly`

**Default**: `false`

*Only* emit `.d.ts` files; do not emit `.js` files.

This setting is useful if you're using a transpiler other than TypeScript to generate your JavaScript.

### `downlevelIteration`

**Default**: `false`. Has no effect if `target` is ES6 or newer.

ECMAScript 6 added several new iteration primitives: the `for / of` loop (`for (el of arr)`), Array spread (`[a, ...b]`), argument spread (`fn(...args)`), and `Symbol.iterator`.
`--downlevelIteration` allows for these iteration primitives to be used more accurately in ES5 environments if a `Symbol.iterator` implementation is present.

#### Example: Effects on `for / of`

Without `downlevelIteration` on, a `for / of` loop on any object is downleveled to a traditional `for` loop:

```ts
// @target: ES5
// @showEmit
const str = "Hello!";
for (const s of str) {
    console.log(s);
}
```

This is often what people expect, but it's not 100% compliant with ECMAScript 6 behavior.
Certain strings, such as emoji (😜), have a `.length` of 2 (or even more!), but should iterate as 1 unit in a `for-of` loop.
See [this blog post by Jonathan New](https://blog.jonnew.com/posts/poo-dot-length-equals-two) for a longer explanation.

When `downlevelIteration` is enabled, TypeScript will use a helper function that checks for a `Symbol.iterator` implementation (either native or polyfill).
If this implementation is missing, you'll fall back to index-based iteration.

```ts
// @target: ES5
// @downlevelIteration
// @showEmit
const str = "Hello!";
for (const s of str) {
    console.log(s);
}
```

>> **Note:** Remember, `downlevelIteration` does not improve compliance if `Symbol.iterator` is not present!

#### Example: Effects on Array Spreads

This is an array spread:

```js
// Make a new array who elements are 1 followed by the elements of arr2
const arr = [1, ...arr2];
```

Based on the description, it sounds easy to downlevel to ES5:

```js
// The same, right?
const arr = [1].concat(arr2);
```

However, this is observably different in certain rare cases.
For example, if an array has a "hole" in it, the missing index will create an *own* property if spreaded, but will not if built using `concat`:

```js
// Make an array where the '1' element is missing
let missing = [0, , 1];
let spreaded = [...missing];
let concated = [].concat(missing);

// true
"1" in spreaded
// false
"1" in concated
```

Just as with `for / of`, `downlevelIteration` will use `Symbol.iterator` (if present) to more accurately emulate ES 6 behavior.

### `esModuleInterop`



### `emitBOM`

**Default**: `false`

Controls whether TypeScript will emit a [byte order mark (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark) when writing output files.
Some runtime environments require a BOM to correctly interpret a JavaScript files; others require that it is not present.
The default value of `false` is generally best unless you have a reason to change it.

### `importHelpers`

For certain downleveling operations, TypeScript uses some helper code for operations like extending class, spreading arrays/objects, and async operations.
By default, these helpers are inserted into files which use them.
This can result in code duplication if the same helper is used in many different modules.

If the `importHelpers` flag is on, these helper functions are instead imported from the [tslib](https://www.npmjs.com/package/tslib) module.
You will need to ensure that the `tslib` module is able to be imported at runtime.
This only affects modules; global script files will not attempt to import modules.

```ts
// @showEmit
// @target: ES5
// @downleveliteration
// --importHelpers off: Spread helper is inserted into the file
// Note: This example also uses --downlevelIteration
export function fn(arr: number[]) {
   const arr2 = [1, ...arr];
}
```

```ts
// @showEmit
// @target: ES5
// @downleveliteration
// @importhelpers
// --importHelpers on: Spread helper is inserted imported from 'tslib'
export function fn(arr: number[]) {
   const arr2 = [1, ...arr];
}
```

### `noEmitHelpers`

Instead of importing helpers with [[importHelpers]], you can provide implementations in the global scope for the helpers you use and completely turn off emitting of helper functions:

```ts
// @showEmit
// @target: ES5
// @downleveliteration
// @noemithelpers

// __spread is assumed to be available
export function fn(arr: number[]) {
   const arr2 = [1, ...arr];
}
```

### `sourceMap`

### `inlineSources`

### `inlineSourceMap`

## Emit Location Options

### `rootDir`

**Default**: The longest common path of all non-declaration input files

When TypeScript compiles files, it keeps the same directory structure in the output directory as exists in the input directory.

For example, let's say you have some input files:

```
MyProj
├── tsconfig.json
├── core
│   ├── a.ts
│   ├── b.ts
│   ├── sub
│   │   ├── c.ts
├── types.d.ts
```

The inferred value for `rootDir` is the longest common path of all non-declaration input files, which in this case is `core/`.

If your `outDir` was `dist`, TypeScript would write this tree:

```
MyProj
├── dist
│   ├── a.ts
│   ├── b.ts
│   ├── sub
│   │   ├── c.ts
```

However, you may have intended for `core` to be part of the output directory structure.
By setting `rootDir: "."` in `tsconfig.json`, TypeScript would write this tree:

```
MyProj
├── dist
|   ├── core
│   │   ├── a.ts
│   │   ├── b.ts
│   │   ├── sub
│   │   │   ├── c.ts
```

Importantly, `rootDir` **does not affect which files become part of the compilation**.
It has no interaction with the `include`, `exclude`, or `files` `tsconfig.json` settings.

Note that TypeScript will never write an output file to a directory outside of `outDir`, and will never skip emitting a file.
For this reason, `rootDir` also enforces that all files which need to be emitted are underneath the `rootDir` path.

For example, let's say you had this tree:

```
MyProj
├── tsconfig.json
├── core
│   ├── a.ts
│   ├── b.ts
├── helpers.ts
```

It would be an error to specify `rootDir` as `core` *and* `include` as `*` because it creates a file (`helpers.ts`) that would need to be emitted *outside* the `outDir` (i.e. `../helpers.js`).

### `outDir`

**Default**: Unspecified

If specified, `.js` (as well as `.d.ts`, `.js.map`, etc.) files will be emitted in the specified directory.
The directory structure of the original source files is preserved; see [[rootDir]] if the computed root is not what you intended.

If not specified, `.js` files will be emitted in the same directory as the `.ts` files they were generated from.

### `outFile`

**Default**: Unspecified

If specified, all *global* (non-module) files will be concatenated into the single output file specified.

If `module` is `system` or `amd`, all module files will also be concatenated into this file after all global content.

Note: `--outFile` cannot be used unless `module` is `None`, `System`, or `AMD`.
This option cannot be used to bundle CommonJS or ES6 modules.

### `out`

>> ❌ **Deprecated:** Do not use this. Use [outFile] instead

The `out` option computes the final file location in a way that is not predictable or consistent.
This option is retained for backward compatibility only.

## Library Options

### `lib`

**Default**: At a minimum `["dom"]`, plus more depending on `target`

TypeScript includes a default set of type definitions for built-in JS APIs (like `Math`), as well as type definitions for things found in browser environments (like `document`).
TypeScript also includes APIs for newer JS features matching the `target` you specify; for example the definition for `Map` is available if `target` is `ES6` or newer.

You may want to change these for a few reasons:
 * Your program doesn't run in a browser, so you don't want the `"dom"` type definitions
 * Your runtime platform provides certain JavaScript API objects (maybe through polyfills), but doesn't yet support the full syntax of a given ECMAScript version
 * You have polyfills or native implementations for some, but not all, of a higher level ECMAScript version



### `noLib`



## File Inclusion Options

### `include` (tsconfig.json) {#include}

### `files` (tsconfig.json) {#files}

### `noResolve`

### `composite`

### `allowJs`

### `forceConsistentCasingInFileNames`

### `charset`

>> ❌ **Deprecated:** This option does nothing.

In prior versions of TypeScript, this controlled what encoding was used when reading text files from disk.
Today, TypeScript assumes UTF-8 encoding, but will correctly detect UTF-16 (BE and LE) or UTF-8 BOMs.

## Module Resolution Options

### `baseUrl`

### `allowSyntheticDefaultImports`

## Typechecking Options

### `strict` {#--strict}

#### `strictPropertyInitialization`

#### `strictBindCallApply`

#### `strictNullChecks`

#### `strictFunctionTypes`

#### `noImplicitAny`

#### `noImplicitThis`

#### `alwaysStrict`

### `suppressExcessPropertyErrors`

### `suppressImplicitAnyIndexErrors`

### `keyofStringsOnly`

>> ❌ **Discouraged:** This flag was provided for backward compatibility reasons and should not be enabled in new or maintained codebases.

**Default**: `false`

This flag changes the `keyof` type operator to return `string` instead of `string | number` when applied to a type with a string index signature.

## Linting Options

### `allowUnreachableCode`

### `allowUnusedLabels`

## Decorators

### `experimentalDecorators`

### `emitDecoratorMetadata`

## Debugging

### `diagnostics`

### `traceResolution`

### `listFiles`

## Miscellaneous

### `init`

### `help`

