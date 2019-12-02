In Javascript files, the compiler understands Typescript types in
JSDoc comments like `@type` and `@param`. However, it has additional
rules to make type resolution work better for Javascript code that
wasn't written with machine checking in mind.

This document spends most of its time on type checking, although the
way that Typescript binds Javascript comes up in a few places.

## Simple Rewrites ##

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
