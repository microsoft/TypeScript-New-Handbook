In Javascript files, the compiler understands Typescript types in
JSDoc comments like `@type` and `@param`. However, it has additional
rules to make type resolution work better for Javascript code that
wasn't written with machine checking in mind. These rules apply only
in JSDoc in Javascript files, and some can be disabled by setting
`"noImplicitAny": true`, which the compiler takes as a signal that the
code is being written with Typescript in mind.

This document spends most of its time on type checking, although the
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

I think it would help to work through an example
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
This is useful, but confusing, in a number of cases:

(functions are the best example).


Since both stages rely on a JSDoc fallback, you can get confusing
semantics when the second fallback gets skipped. Specifically, you may
resolve a symbol that has no type meaning in the first stage. Then you
may be able generate a type without using the JSDoc fallback when
finding the type.

TODO: Make an example of this; I think it only happens for complex
merges, so it may not be suitable for a short-ish document.

## Expandoooooooooooo ##

(functions especially)

## CommonJS ##

## Weird Stuff ##

- `@enum`
- `A.prototype.m = function() { ... }` needs to put names in the scope
  of A in place.


1. getTypeFromTypeReference
1. getIntendedJSDocTypeReference
2. getTypeFromJSDocValueReference
3. getTypeOfSymbol
  - getTypeOfFunctionModuleEnumClass
  - getTypeOfVariablePropertyParameter
5. commonjs support -- resolveTypeReferenceName and other places
6. resolveEntityName