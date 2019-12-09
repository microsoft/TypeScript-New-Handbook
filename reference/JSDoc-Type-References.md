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
const FOO = "foo";
const BAR = "bar";

/** @param {FOO | BAR} type */
function f(type) {
}
```

In the compiler, this is resolved in two stages. Both stages use a
JSDoc fallback. First, in `getTypeFromTypeReference`, after first
checking the simple rewrites above, the compiler
resolves the name `FOO`. Here's a simplified version of the name resolution code:

```ts
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

Because `resolveTypeReferenceName` fails to find a type named `FOO`,
the code makes a second calls looking for a value named `FOO`, which
is found. Then it passes the `FOO` symbol to
`getTypeReferenceType`, whose code looks a bit like this:

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

In the same way as name resolution, type resolution first looks for
the type of the type declaration of a symbol with `getDeclaredTypeOfSymbol`.
But there *is* no type declaration for `FOO`, so it returns
`undefined`. Then the fallback code looks for the type of the value
declaration for `FOO`, which it finds to be `"foo"`.

For comparison, here is an example that has both a value declaration
and a type declaration:

```ts
var i = 0
interface i {
  e: 1
  m: 1
}
```

If you ask for the type of the value declaration of `i` &mdash; say, with
`/** @type {typeof i} */` &mdash; you'll get `number` from `var i = 0`. If
you ask for the type of `i`'s type declaration (with `/** @type {i} */`
this time), you'll get `{ e: 1, m: 1 }` from the `interface`
declaration.

But in Javascript, you can't even write `interface`, so what should
`/** @type {i} */` mean if your program is just:

```js
var i = 0
```

With no type declaration, the compiler just reuses the type of the value
declaration: `number`. This is equivalent to inserting the `typeof`
type operator to get `typeof i`. The effect is to make types more
Javascripty, allowing you to specify objects as example types without
having to learn about the difference between type and value:

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

In `checker.ts`, `getTypeFromTypeReference` contains the symbol
resolution fallback. Then it calls `getTypeReferenceType`, which
contains the type resolution fallback.

## Bonus: `@enum` tag ##

The `@enum` tag is quite unlike Typescript's `enum`. Instead, it's
basically a `@typedef` with some additional checking. Here's an
example:


``` js
/** @enum {string} */
const ProblemSleuth = {
    mode: "hard-boiled",
    compensation: "adequate",
};
```

The name of the type comes from the subsequent declaration
`ProblemSleuth`, which also works for `@typedef`. In fact, the
meaning is almost equivalent to a `@typedef` followed by a
`@type`:

``` js
/** @typedef {string} ProblemSleuth */
/** @type {{ [s: string]: ProblemSleuth }} */
const ProblemSleuth = {
    mode: "hard-boiled",
    compensation: "adequate",
};
```

The difference is that, although `ProblemSleuth`'s initializer is
checked for assignability to the index signature type, the type of the
value `const ProblemSleuth` is not the index signature type. It's
still the type of the initializer. It has exactly two properties, both
of type `string`. Because of that type, assignment of new properties
is not allowed, so the following is an error:

``` js
ProblemSleuth.solicitations = "numerous"
```

