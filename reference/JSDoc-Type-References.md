In Javascript files, the compiler understands Typescript types in
JSDoc comments like `@type` and `@param`. However, it has additional
rules to make type resolution work better for Javascript code that
wasn't written with machine checking in mind. These rules apply only
in JSDoc in Javascript files, and some can be disabled by setting
`"noImplicitAny": true`, which the compiler takes as a signal that the
code is being written with Typescript in mind.

This document first describes the way Javascript type resolution is
different, because those differences are bigger and more surprising.
Then it covers differences in name resolution.

## Simple Rewrites ##

The simplest Javascript-only rule is to rewrite the primitive object
types to the usual primitive types, plus `Object` to `any`. These are
commonly used interchangeably in JSDoc:

Type        | Resolved Type
------------|--------------
`Number`    | `number`
`String`    | `string`
`Boolean`   | `boolean`
`Object`    | `any`

In Typescript, the primitive type `number` is nearly always the right
type; whenever methods from the object type `Number` are needed, the
compiler asks for the apparent type anyway, and the apparent type of
`number` is `Number`.

Neither `object` nor `Object` have defined properties or string index
signatures, which means that they give too many errors to be useful in
Javascript. Until Typescript 3.7, both were rewritten to `any`, but we
found that few people used `object` in JSDoc, and that more and more
JSDoc authors wanted to use `object` with its Typescript meaning. The
rewrite `Object -> any` is disabled when `"noImplicitAny": true`,
which the compiler takes as a signal that the code is being written
with Typescript in mind.

There are also rewrites of other JSDoc types that are equivalent to
built-in Typescript types:

Type                  | Resolved Type
----------------------|--------------
`Null`                | `null`
`Undefined`           | `undefined`
`Void`                | `void`
`function`            | `Function`
`Object<string,Type>` | `{ [x: string]: Type }`
`Object<number,Type>` | `{ [x: number]: Type }`

The first three of this list are commonly used in unchecked
Javascript, while the last three are commonly used in Javascript that
is checked by the Closure compiler.

Finally, `array` and `promise` rewrite to `Array<any>` and `Promise<any>`
respectively, since they, too, are used interchangeably:

Type        | Resolved Type
------------|--------------
`array`     | `any[]`
`promise`   | `Promise<any>`

Note that `array<number>` does *not* rewrite to `number[]`; it's just
an error. Same for `promise<number>`.

### Where To Find The Code ###

`getIntendedJSDocTypeReference` in `checker.ts`.

## Values as Types ##

The compiler maintains three namespaces: one each for values, types and
namespaces. Put another way, each name can have a value meaning, a
type meaning and a namespace meaning. However, there are fewer ways
to declare and reference types in Javascript, and the distinction
between type and value can be subtle, so for Javascript, the compiler
tries to resolve type references as values if it can't find a type.

Here's an example:

```ts
const FOO = "foo"
const BAR = "bar"

/** @param {FOO | BAR} type */
function f(type) {
}
```

In the compiler, this is resolved in two stages. Both stages use a
JSDoc fallback. First, in `getTypeFromTypeReference`, after first
checking the simple rewrites above, the compiler
resolves the name. Here's a simplified version of the code:

``` ts
let symbol: Symbol | undefined;
let type: Type | undefined;
type = getIntendedTypeFromJSDocTypeReference(node);
if (!type) {
  symbol = resolveTypeReferenceName(node, SymbolFlags.Type);
  if (symbol === unknownSymbol) {
    symbol = resolveTypeReferenceName(node, SymbolFlags.Value);
  }
  type = getTypeReferenceType(node, symbol);
}
```

If `resolveTypeReferenceName` fails to find a type, then the code
calls it again looking for a value. Then it passes the resulting symbol
to `getTypeReferenceType`:

``` ts
if (symbol === unknownSymbol) {
  return errorType;
}
const t = getDeclaredTypeOfSymbol(symbol);
if (t) {
  return t;
}
if (symbol.flags & SymbolFlags.Value && isJSDocTypeReference(node)) {
  return getTypeOfSymbol(symbol);
}
return errorType;
```

Normally type resolution only looks in the type
namespace, but when it finds nothing there, a fallback looks in the
value namespace.

TODO: Repeat example since there is a lot of text in the way.
In the example above, `FOO` is a value, a block-scoped `const`. During
type resolution, there is no type named `FOO`. So instead the compiler
uses the value named `FOO`.

Now there is a problem: the value `FOO` has no type declaration, only
a value declaration. So we now get the type of the value declaration
instead of the type of the type declaration.

I think it would help to look at an example
that has both a value declaration and a type declaration:

```ts
var i = 0
interface i {
  e: 1
  m: 1
}
```

If you ask for the type of the value declaration of `i`, you'll get
`number`. If you ask for the type of type declaration of `i`, you'll
get `{ e: 1, m: 1 }`. In Javascript, you can't *write* `interface`, so
it would just be

```js
var i = 0
```

But what if you treat `i` as a type?

```js
/** @type {i} */
var j
```

The compiler just reuses the type of the value declaration: `number`.
This is equivalent to inserting the `typeof` type operator to get
`typeof i`.
The effect is to make types more Javascripty, allowing you to specify
objects as example types without having to learn about the difference
between type and value:

``` js
/**
 * @param {number} n
 * @param {number} m
 * @returns {-1 | 0 | 1}
 */
function exampleCompare(n, m) {
}

/** @param {exampleCompare} f */
function sort(f, l) {
  // ...
}
```

This also works with objects, whether anonymous or an instance of a class:

``` js
const initial = {
  frabjous: true,
  beamish: true,
  callooh: "callay",
}

/** @param {initial} options */
function setup(options) {
}
```

Relying on this fallback for complex types does produce a simpler
type, but makes the equivalent Typescript really confusing to produce:

``` js
import { options } from './initial'
/**
 * @param {keyof options} k
 * @param {options[keyof options]} v
 */
function demo(k, v) {
    options[k] = v
}
```

is equivalent to the Typescript:

```ts
import { options } from './initial'
function demo(k: keyof typeof options, v: typeof options[keyof typeof options]) {
}
```

Knowing where to insert the missing `typeof` operators requires more
experience with complex type than most people can be expected to have.

### Where To Find The Code ###

In `checker.ts`, `getTypeFromTypeReference` contains the symbol fallback.
Then it calls `getTypeReferenceType`, which contains the type fallback.

## Expando ##

Expando declarations are those that start with an initial declaration
and add properties to it, like so:

``` js
const ns = {}
ns.x = 1
ns.f = function () {
}
ns.s = 'otra'
```

In Javascript code, the compiler supports this pattern for
construction of objects. It also supports it for functions and classes.

Syntactically, expando objects are of 3 kinds:

1. Functions
2. Classes
3. Empty objects

Each expando assignment is treated as a separate namespace
declaration, which then merges with all the other declarations of the
object. That is, the following code declares one variable with three
declarations; one value declaration and two namespace declarations.
The last two lines also each declare one property with a value declaration.

```js
function ichthyosaur() { }
ichthyosaur.shonisaurus = function() { }
ichthyosaur.shastasaurus = function() { }
```

TODO: Explain aliasing.

### Where To Find The Code ###

Object and class expandos are checked just like Typescript. Only their
binding differs: in src/compiler/binder.ts,
`bindSpecialPropertyAssignment` delegates to `bindPropertyAssignment`.

## CommonJS ##

Like expando, except that you are often directly making entries in the
module's symbol table instead.

TODO: Explain aliasing.

<!--
## Weird Stuff ##

- `@enum`
- `A.prototype.m = function() { ... }` needs to put names in the scope
  of A in place.
- Actually there is a lot of weirdness all over from classes and
  commonjs, and the combination of the two.
-->
