# Compiler Options

TypeScript has a wide array of configuration options.
This page is organized by theme, and within each theme the options are roughly sorted in order of how often they're likely to be used.

All settings in TypeScript are optional.

For brevity, this page uses "is set" as shorthand for "is set to `true`".

__toc__

## Code Emit Options

### `target`

**Allowed Values**: `ES3` (default), `ES5`, `ES6`/`ES2015` (synonomous), `ES7`/`ES2016`, `ES2017`, `ES2018`, `ES2019`, `ESNext`

All modern browsers support all ES6 features, so `ES6` is a good choice.
You might choose to set a lower target if your code is deployed to older environments, or a higher target if your code only runs on newer environments.

The `target` setting changes which JS features are downleveled or left intact.
For example, an arrow function `() => this` will be turned into an equivalent `function` expression if `target` is ES5 or lower.

`target` also changes the default value of [[`lib`]].
You may "mix and match" `target` and `lib` settings as desired.

The value `ESNext` refers to whatever the highest version TypeScript supports at the time is.
This setting should be used with caution, since it doesn't mean the same thing between TypeScript versions and can make upgrades less predictable.

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

**Default**: `false`

Enables the generation of [sourcemap files](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map).
These files allow debuggers and other tools to display the original TypeScript source code when actually working with the emitted JavaScript files.
Source map files are emitted as `.js.map` (or `.jsx.map`) files next to the corresponding `.js` output file.

The `.js` files will in turn contain a sourcemap comment to indicate to tools where the files are:
```js
//# sourceMappingURL=main.js.map
```

### `inlineSourceMap`

**Default**: `false`

When set, instead of writing out a `.js.map` file to provide source maps, TypeScript will embed the source map content in the `.js` files.
Although this results in larger JS files, it can be convenient in some scenarios.
For example, you might want to debug JS files on a webserver that doesn't allow `.map` files to be served.

Mutually exclusive with `sourceMap`.

### `inlineSources`

**Default**: `false`

When set, TypeScript will include the original content of the `.ts` file as an embedded string in the source map.
This is often useful in the same cases as `inlineSourceMap`.

Requires either `sourceMap` or `inlineSourceMap` to be set.

## Emit Location Options

### `rootDir`

**Default**: The longest common path of all non-declaration input files. If `composite` is set, the default is instead the directory containing the `tsconfig.json` file.

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

>> ❌ **Deprecated:** Do not use this. Use [[outFile]] instead

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

| Name                    | Contents / Notes           |
|-------------------------|----------------------------|
| ES5                     | Core definitions for all ES3 and ES5 functionality |
| ES2015                  | Additional APIs available in ES2015 (also known as ES6) |
| ES6                     | Alias for "ES2015" |
| ES2016                  | Additional APIs available in ES2016 |
| ES7                     | Alias for "ES2016" |
| ES2017                  | Additional APIs available in ES2017 |
| ES2018                  | Additional APIs available in ES2017 |
| ESNext                  | Additional APIs available in ESNext |
| DOM                     | DOM definitions (`window`, `document`, etc.) |
| DOM.Iterable            | |
| WebWorker               | APIs available in WebWorker contexts |
| ScriptHost              | |
| ES2015.Core             | |
| ES2015.Collection       | |
| ES2015.Generator        | |
| ES2015.Iterable         | |
| ES2015.Promise          | |
| ES2015.Proxy            | |
| ES2015.Reflect          | |
| ES2015.Symbol           | |
| ES2015.Symbol.WellKnown | |
| ES2016.Array.Include    | |
| ES2017.object           | |
| ES2017.Intl             | |
| ES2017.SharedMemory     | |
| ES2017.String           | |
| ES2017.TypedArrays      | |
| ES2018.Intl             | |
| ES2018.Promise          | |
| ES2018.RegExp           | |
| ESNext.AsyncIterable    | |
| ESNext.Array            | |
| ESNext.Intl             | |
| ESNext.Symbol           | |

### `noLib`

Disables the automatic inclusion of any library files.
If this option is set, `lib` is ignored.

## File Inclusion Options

### `include` (tsconfig.json) {#include}

**Allowed values**: An array of strings

**Default**: `[]` if `files` is specified, otherwise `["**/*"]`

```
{
   "include": ["src/**", "tests/**"]
}
```

Specifies an array of filenames or patterns to include in the program.
These filenames are resolved relative to the directory containing the `tsconfig.json` file.

`include` and `exclude` support wildcard characters to make glob patterns:
 * `*` matches zero or more characters (excluding directory separators)
 * `?` matches any one character (excluding directory separators)
 * `**/` recursively matches any subdirectory

If a glob pattern doesn't include a file extension, then only files with supported extensions are included (e.g. `.ts`, `.tsx`, and `.d.ts` by default, with `.js` and `.jsx` if `allowJs` is set to true).

### `exclude` (tsconfig.json) {#exclude}

**Allowed values**: An array of strings

**Default**: `["node_modules", "bower_components", "jspm_packages"]`, plus the value of `outDir` if one is specified.

Specifies an array of filenames or patterns that should be skipped when resolving `include`.

**Important**: `exclude` *only* changes which files are included as a result of the `include` setting.
A file specified by `exclude` can still become part of your program due to an `import` statement in your code, a `types` inclusion, a `/// <reference` directive, or being specified in the `files` list.
It is not a mechanism that **prevents** a file from being included in the program - it simply changes what the `include` setting finds.

### `files` (tsconfig.json) {#files}

**Allowed values**: An array of strings

**Default**: None

Specifies an array of files to include in the program.
An error occurs if any of the files can't be found.

### `composite`

**Default**: `false`

The `composite` option enforces certain constraints that make it possible for build tools (including TypeScript itself, under `--build` mode) to quickly determine if a project has been built yet.

When this setting is on:
 * The `rootDir` setting, if not explicitly set, defaults to the directory containing the `tsconfig.json` file.
 * All implementation files must be matched by an `include` pattern or listed in the `files` array. If this constraint is violated, `tsc` will inform you which files weren't specified.
 * `declaration` defaults to `true`

### `allowJs`

### `forceConsistentCasingInFileNames`

**Default**: `false`

TypeScript follows the case sensitivity rules of the file system it's running on.
This can be problematic if some developers are working in a case-sensitive file system and others aren't.
If a file attempts to import `fileManager.ts` by specifying `./FileManager.ts` the file will be found in a case-insensitive file system, but not on a case-sensitive file system.

When this option is set, TypeScript will issue an error if a program tries to include a file by a casing different from the casing on disk.

We recommend enabling this option in all projects.

### `charset`

> ❌ **Deprecated:** This option does nothing.

In prior versions of TypeScript, this controlled what encoding was used when reading text files from disk.
Today, TypeScript assumes UTF-8 encoding, but will correctly detect UTF-16 (BE and LE) or UTF-8 BOMs.

### `noResolve`

> 🧙 This option is rarely used.

**Default**: `false`

By default, TypeScript will examine the initial set of files for `import` and `<reference` directives and add these resolved files to your program.

If `noResolve` isn't set, this process doesn't happen.
However, `import` statements are still checked to see if they resolve to a valid module, so you'll need to make sure this is satisfied by some other means.

## Module Resolution Options

### `baseUrl`

### `paths`

### `allowSyntheticDefaultImports`

## Typechecking Options

### `strict` {#--strict}

> ✅ We recommend enabling this in all codebases, especially new ones

**Default**: `false`

The `strict` flag enables a wide range of type checking behavior that results in stronger guarantees of program correctness.
Turning this on is equivalent to enabling all of the *strict mode family* options, which are outlined below.
You can then turn off individual strict mode family checks as needed.

Future versions of TypeScript may introduce additional stricter checking under this flag, so upgrades of TypeScript might result in new type errors in your program.
When appropriate and possible, a corresponding flag will be added to disable that behavior.

#### `strictNullChecks`

> ✅ We recommend enabling this in all codebases, especially ones

**Default**: `false`, unless `strict` is set

When `strictNullChecks` is `false`, `null` and `undefined` are considered to be valid values of all types.
This can lead to unexpected errors at runtime.

When `strictNullChecks` is `true`, `null` and `undefined` have their own distinct types and you'll get a type error if you try to use them where a concrete value is expected.

#### `strictPropertyInitialization`

**Default**: `false`, unless `strict` is set

When set, it becomes an error to declare a class property without directly initializing it before the end of the constructor.
See the corresponding section in [[Classes]].

#### `strictBindCallApply`

**Default**: `false`, unless `strict` is set

When set, TypeScript will check that the built-in methods of functions `call`, `bind`, and `apply` are invoked with correct argument for the underlying function:

```ts
// With strictBindCallApply on
function fn(x: string) {
   return parseInt(x);
}

const n1 = fn.call(undefined, "10");
      ^?

const n2 = fn.call(undefined, false);
```

Otherwise, these functions accept any arguments and will return `any`:

```ts
// @strictBindCallApply: false

// With strictBindCallApply off
function fn(x: string) {
   return parseInt(x);
}

// Note: No error; return type is 'any'
const n = fn.call(undefined, false);
      ^?
```

#### `strictFunctionTypes`

> ✅ We strongly recommend enabling this in all codebases

**Default**: `false`, unless `strict` is set

When enabled, this flag causes functions parameters to be checked more correctly.

Here's a basic example with `strictFunctionTypes` *off*:
```ts
// @strictFunctionTypes: false
function fn(x: string) {
   console.log("Hello, " + x.toLowerCase());
}

type StringOrNumberFunc = (ns: string | number) => void;

// Unsafe assignment
let func: StringOrNumberFunc = fn;
// Unsafe call - will crash
func(10);
```

With `strictFunctionTypes` *on*, the error is correctly detected:
```ts
function fn(x: string) {
   console.log("Hello, " + x.toLowerCase());
}

type StringOrNumberFunc = (ns: string | number) => void;

// Unsafe assignment is prevented
let func: StringOrNumberFunc = fn;
```

During development of this feature, we discovered a large number of inherently unsafe class hierarchies, including some in the DOM.
Because of this, the setting only applies to functions written in *function* syntax, not to those in *method* syntax:
```ts
type Methodish = {
   func(x: string | number): void;
};
function fn(x: string)  {
   console.log("Hello, " + x.toLowerCase());
}

// Ultimately an unsafe assignment, but not detected
const m: Methodish = {
   func: fn
};
m.func(10);
```

#### `noImplicitAny`

> ✅ We strongly recommend enabling this in all codebases

**Default**: `false`, unless `strict` is set

In some cases where no type annotations are present, TypeScript will fall back to a type of `any` for a variable.
This can cause some errors to be missed:

```ts
// @noImplicitAny: false
function fn(s) {
   // No error?
   console.log(s.subtr(3))
}
fn(42);
```

When `noImplicitAny` is set, TypeScript will issue an error whenver it would have inferred `any`:
```ts
function fn(s) {
   console.log(s.subtr(3))
}
```

#### `noImplicitThis`

**Default**: `false`, unless `strict` is set

### `isolatedModules`

**Default**: `false`

While you can use TypeScript to produce JavaScript code from TypeScript code, it's also common to use other transpilers such as [Babel](https://babeljs.io) to do this.
However, most other transpilers only operate on a single file at a time, so can't apply code transforms that depend on whole-program analysis.
This restriction also applies to TypeScript's `ts.transpileModule` API which is used by some build tools.

These limitations can cause runtime problems for some TypeScript constructs.
Setting the `isolatedModules` flag tells TypeScript to warn you if you write certain code that can't be correctly interpreted by a single-file transpilation process.
It does not change the behavior of your code, or otherwise change the behavior of TypeScript's checking and emitting process.

#### Exports of Non-Value Identifiers

In TypeScript, you can import a *type* and then subsequently export it:
```ts
// @noErrors
import { someType, someFunction } from "someModule";

someFunction();

export { someType, someFunction };
```

Because there's no value for `someType`, the emitted `export` will not try to export it (this would be a runtime error):

```js
export { someFunction };
```

Single-file transpilers don't know whether `someType` produces a value or not, so it's an error to export a name that only refers to a type if `isolatedModules` is set.

#### Non-Module Files

If `isolatedModules` is set, all implementation files must be *modules*.
An error occurs if any file isn't a module:

```ts
// @isolatedModules
function fn() { }
```

This restriction doesn't apply to `.d.ts` files

#### References to `const enum` members

In TypeScript, when you reference a `const enum` member, the reference is replaced by its actual value in the emitted JavaScript:

```ts
// @showEmit
// @removeComments
declare const enum Numbers {
   Zero = 0,
   One = 1
}
console.log(Numbers.Zero + Numbers.One);
```

Without knowledge of the values of these members, other transpilers can't replace the references to `Number`, which would be a runtime error if left alone (since there is no `Numbers` object at runtime).
Because of this, when `isolatedModules` is set, it is an error to reference an ambient `const enum` member.

### `suppressExcessPropertyErrors`

> ❌ **Discouraged:** This flag is provided for backward compatibility. Consider using `@ts-ignore` instead.

This disables reporting of excess property errors, such as the one shown in the following example

```ts
type Point = { x: number, y: number };
const p: Point = { x: 1, y: 3, m: 10 };
```


### `suppressImplicitAnyIndexErrors`

> ❌ **Discouraged:** This flag is provided for backward compatibility. Consider using `@ts-ignore` instead.

This disables reporting of implicit `any` warnings when indexing into objects, such as shown in the following example

```ts
const obj = { x: 10 };
console.log(obj["foo"]);
```

### `keyofStringsOnly`

> ❌ **Discouraged:** This flag was provided for backward compatibility reasons and should not be enabled in new or maintained codebases.

This flag changes the `keyof` type operator to return `string` instead of `string | number` when applied to a type with a string index signature.

## Linting Options

### `allowUnreachableCode`

Disables warnings about unreachable code.
These warnings are only about code which is provably unreachable due to syntactic construction, like the example below.

```ts
// @allowUnreachableCode: false
function fn(n: number) {
   if (n > 5) {
      return true;
   } else {
      return false;
   }
   return true;
}
```

TypeScript doesn't error on the basis of code which *appears* to be unreachable due to type analysis.

### `allowUnusedLabels`

Disables warnings about unused labels.
Labels are very rare in JavaScript and typically indicate an attempt to write an object literal:

```ts
// @allowUnusedLabels: false
function f(a: number) {
   // Forgot 'return' statement!
   if (a > 10)
   {
       m: 0
   }
}
```

## Decorators

### `experimentalDecorators`

### `emitDecoratorMetadata`

## Debugging

### `diagnostics`

### `traceResolution`

### `listFiles`

## Miscellaneous

### `alwaysStrict`

```ts
// @showEmit
// @alwaysStrict: true
function fn() { }
```

```ts
// @showEmit
// @alwaysStrict: false
function fn() { }
```


### `noImplicitUseStrict`

> 🧙‍ You shouldn't need this

By default, when emitting a module file to a non-ES6 target, TypeScript emits a `"use strict";` prologue at the top of the file.
This setting disables that.

```ts
// @showEmit
// @target: ES3
// @module: AMD
// @noImplicitUseStrict
export function fn() { }
```

```ts
// @showEmit
// @target: ES3
// @module: AMD
export function fn() { }
```

### `init`

### `help`

