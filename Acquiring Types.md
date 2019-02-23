# Acquiring Types

Throughout the sections you've read so far, we've been demonstrating basic TypeScript concepts using the built-in functions present in all JavaScript runtimes.
However, almost all JavaScript today includes many libraries to accomplish common tasks.
Having types for the parts of your application that *aren't* your code will greatly improve your TypeScript experience.
Where do these types come from?

## `.d.ts` files

TypeScript has two main kinds of files.
`.ts` files are *implementation* files that contain types and executable code.
`.d.ts` files are *declaration* files that contain *only* type information.

We'll learn more about how to write our own definition files later.

## Built-in Type Definitions

TypeScript includes declaration files for all of the standardized built-in APIs available in JavaScript runtimes.
This includes things like methods and properties of built-in types like `string` or `function`, top-level names like `Math` and `Object`, and their associated types.
By default, TypeScript also includes types for things available when running inside the browser, such as `window` and `document`; these are collectively referred to as the DOM APIs.

TypeScript names these declaration files with the pattern `lib.[something].d.ts`.
If you navigate into a file with that name, you can know that you're dealing with some built-in part of the platform, not user code.

### `target` setting

The methods, properties, and functions available to you actually vary based on the *version* of JavaScript your code is running on.
For example, the `startsWith` method of strings is available only starting with the version of JavaScript referred as *ECMAScript 6*.

Being aware of what version of JavaScript your code ultimately runs on is important because you don't want to use APIs that are from a newer version than the platform you deploy to.
This is one function of the `target` compiler setting.

TypeScript helps with this problem by varying which `lib` files are included by default based on your `target` setting.
For example, if `target` is `ES5`, you will see an error if trying to use the `startsWith` method, because that method is only available in `ES6` or later.

### `lib` setting

The `lib` setting allows more fine-grained control of which built-in declaration files are considered available in your program.
See the documentation page on [[lib]] for more information.

## External Definitions

For non-built-in APIs, there are a variety of ways you can get declaration files.
How you do this depends on exactly which library you're getting types for.

### Bundled Types

If a library you're using is published as an npm package, it may include type declaration files as part of its distribution already.
You can read the project's documentation to find out, or simply try importing the package and see if TypeScript is able to automatically resolve the types for you.

If you're a package author considering bundling type definitions with your package, you can read our guide on [[bundling type definitions]].

### DefinitelyTyped / `@types`

The [DefinitelyTyped repository](https://github.com/DefinitelyTyped/DefinitelyTyped/) is a centralized repo storing declaration files for thousands of libraries.
The vast majority of commonly-used libraries have declaration files available on DefinitelyTyped.

Definitions on DefinitelyTyped are also automatically published to npm under the `@types` scope.
The name of the types package is always the same as the name of the underlying package itself.
For example, if you installed the `react` npm package, you can install its corresponding types by running

```
 npm install --save-dev @types/react
```

TypeScript automatically finds type definitions under `node_modules/@types`, so there's no other step needed to get these types available in your program.

## Your Own Definitions

Test


    * Built-in (lib.d.ts)
    * Inference
    * Your own types
    * Packaged types
    * DefinitelyTyped
