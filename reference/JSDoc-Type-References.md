In Javascript files, the compiler understands Typescript types in
JSDoc comments like `@type` and `@param`. However, it has additional
rules to make type resolution work better for Javascript code that
wasn't written with machine checking in mind. These rules apply only
in JSDoc in Javascript files, and some can be disabled by setting
`"noImplicitAny": true`, which the compiler takes as a signal that the
code is being written with Typescript in mind.

This document spends most of its time on type checking, although the
way that Typescript binds Javascript comes up in a few places.

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

## Expandoooooooooooo ##

(functions especially)

## CommonJS ##

## Weird Stuff ##

Just `@enum`, but ... that's enough.

1. getTypeFromTypeReference
1. getIntendedJSDocTypeReference
2. getTypeFromJSDocValueReference
3. getTypeOfSymbol
  getTypeOfFunctionModuleEnumClass
  getTypeOfVariablePropertyParameter
4. getTypeOfDeclaredSymbol
  I don't think there's much here?
5. commonjs support -- resolveTypeReferenceName and other places
