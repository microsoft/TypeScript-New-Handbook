# Modules

Starting with ECMAScript 2015, JavaScript has a concept of modules.
TypeScript shares this concept.

Modules are executed within their own scope, not in the global scope.
This means that variables, functions, classes, etc. declared in a module are not visible outside the module unless they are explicitly exported using one of the export forms.
Conversely, to consume a variable, function, class, interface, etc. exported from a different module, it has to be imported using one of the import forms.

Modules are declarative: the relationships between modules are specified in terms of imports and exports at the file level.

Modules import one another using a module loader.
At runtime the module loader is responsible for locating and executing all dependencies of a module before executing it.
Well-known modules loaders used in JavaScript are the CommonJS module loader for Node.js and require.js for Web applications.

In TypeScript, just as in ECMAScript 2015, any file containing a top-level import or export is considered a module.
Conversely, a file without any top-level import or export declarations is treated as a script whose contents are available in the global scope (and therefore to modules as well).

__toc__

## Module Systems



### ES Modules

>> [Background Reading: ES Modules: A cartoon deep-dive](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)






## Import Forms










## Importing CommonJS modules with ES Syntax






  * Overview of Choices
    * ES6 (read MDN)
    * CommonJS
    * AMD
    * SystemJS
    * UMD
    * See the appendix because oh my god
  * Import forms
  * Paths and Module resolution
  * Synthetic defaults
  * Import ellision

