# Compiler Options

TypeScript has a wide array of configuration options.

__toc__

## Code Emit Options

### `target`

### `module`

### `jsx`

### `jsxFactory`

### `declaration`

### `declarationDir`

### `declarationMap`

### `emitDeclarationOnly`

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