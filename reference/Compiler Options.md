# Compiler Options

TypeScript has a wide array of configuration options.

__toc__

## Code Emit Options

### `target`

**Allowed Values**: `ES3` (default), `ES5`, `ES6`/`ES2015` (synonomous), `ES2016`, `ES2017`, `ES2018`, `ES2019`, `ESNext`

All modern browsers support all ES6 features, so `ES6` is a good choice.
You might choose to set a lower target if your code is deployed to older environments, or a higher target if your code only runs on newer environments.

The `target` setting changes which JS features are downleveled or left intact.
For example, an arrow function `() => this` will be turned into an equivalent `function` expression if `target` is ES5 or lower.

`target` also changes the default value of [lib].
You may "mix and match" `target` and `lib` settings as desired.

### `module`

**Allowed Values**: `CommonJS` (default if `target` is `ES3` or `ES5`), `ES6`/`ES2015` (synonymous, default for `target` `ES6` and higher), `None`, `UMD`, `AMD`, `System`, `ESNext`

Sets the module system for the program. See the [Modules] chapter for more information.

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

Emits declaration files to a different directory

### `declarationMap`

**Default**: `false`

Generates a source map for `.d.ts` files that maps back to the original `.ts` source file.

### `emitDeclarationOnly`

**Default**: `false`

*Only* emit `.d.ts` files; do not emit `.js` files.

This setting is useful if you're using a transpiler other than TypeScript to generate your JavaScript.

### `downlevelIteration`

### `esModuleInterop`

### `emitBOM`

**Default**: `false`

Controls whether TypeScript will emit a [byte order mark (BOM)](https://en.wikipedia.org/wiki/Byte_order_mark) when writing output files.
Some runtime environments require a BOM to correctly interpret a JavaScript files; others require that it is not present.
The default value of `false` is generally best unless you have a reason to change it.

### `importHelpers`

### `sourceMap`

### `inlineSources`

### `inlineSourceMap`

## Emit Location Options

### `rootDir`

### `outDir`

### `outFile`

Note: `--outFile` cannot be used unless `module` is `None`, `System`, or `AMD`

### `out`

## Library Options

### `noLib`

### `lib`

## File Inclusion Options

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