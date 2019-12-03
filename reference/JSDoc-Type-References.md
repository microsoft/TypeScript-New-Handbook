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
spends most of its time on type checking, although the
way that Typescript binds Javascript comes up in a few places.

Later: Actually I think we'll stay in the checker the whole time, but
cover both type resolution and value resolution.

## Simple Rewrites ##

The simplest Javascript-only rule is to rewrite the primitive object
types to real primitives.

Type        | Resolved Type
------------|--------------
`Number`    | `number`
`String`    | `string`
`Boolean`   | `boolean`
`Object`    | `any`

The rewrite `Object -> any` is disabled when `"noImplicitAny": true`,
which the compiler takes as a signal that the code is being written
with Typescript in mind. Old versions of Typescript also rewrote
`object -> any`, but stopped in Typescript 3.7.

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

Finally, `Array` and `Promise` both default their type parameters to
`any` when no type parameters are provided:

Type        | Resolved Type
------------|--------------
`Array`     | `any[]`
`Promise`   | `Promise<any>`

This is standard for all type references in JSDoc, so I don't think
it's needed anymore. It only applies when `"noImplicitAny": false`.

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
JSDoc fallback. First the compiler resolves the name; then it finds
the type for the name. Normally type resolution only looks in the type
namespace, but when it finds nothing there, a fallback looks in the
value namespace.

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
The effect is to make types more Javascripty, which can be useful:

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

The fallbacks can become especially confusing when they let you skip a
the `typeof` operator that is required to reference values in
Typescript:

``` js
import { options } from './initial'
/**
 * @param {keyof typeof options} k
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

## Expandoooooooooooo ##

Expando declarations are those that start with an initial declaration
and add properties to it. There is some local special-casing that
works with noImplicitAny in Typescript, but Javascript has similar
support that starts from the opposite end: top-level assignments in
Javascript code. The intent of this support is to understand the names
used in top-level construction of objects.

Semantically, expando objects are of 3 kinds:

1. Functions
2. Classes
3. Empty objects (or non-empty prototype objects)

Each expando assignment is treated as a separate namespace
declaration, which then merges with all the other declarations of the
object. That is, the following code declares one variable with three
declarations; one value declaration and two namespace declarations.

```js
function ichthyosaur() { }
ichthyosaur.shonisaurus = function() { }
ichthyosaur.shastasaurus = function() { }
```

TODO: Find the entry points for expandos.

## CommonJS ##

Like expando, except that you are often directly making entries in the
module's symbol table instead.

## Weird Stuff ##

- `@enum`
- `A.prototype.m = function() { ... }` needs to put names in the scope
  of A in place.
- Actually there is a lot of weirdness all over from classes and
  commonjs, and the combination of the two.


TODO: Find a good way to catalogue these locations.

1. getTypeFromTypeReference
1. getIntendedJSDocTypeReference
2. getTypeFromJSDocValueReference
3. getTypeOfSymbol
  - getTypeOfFunctionModuleEnumClass
  - getTypeOfVariablePropertyParameter
5. commonjs support -- resolveTypeReferenceName and other places
6. resolveEntityName
