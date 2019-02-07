# Everyday Types

## Built-in Types

    * string, number, boolean, any, and array
    * Show inference and rules
      * Examples of allowed and disallowed operations
    * Type annotations on variable declarations

## Functions

    * Parameter type annotations
    * Return type annotations and inference
    * Inference in function expressions

## Objects

    * Anonymous object types
    * Type aliases and Interfaces
    * Optional properties

## Union Types

    * Simple concept: "This or that"
    * Unions of primitives
    * Introduce concept of type narrowing and demonstrate it with typeof

## Literal Types

    * String literals
    * Numeric literals
    * Boolean's just an alias for `true` | `false`
    * Combine these with unions for e.g. `"GET" | "POST"`
    * Why do I have to sometimes write `"foo" as "foo"`

## `null` and `undefined`

    * --strictNullChecks: turn it on
    * Undefined in optional parameters and properties
    * Demonstrate basic narrowing to check for them
    * Postfix unary `!`

## Type Assertions

    * Sometimes you know more than the checker
    * `e as T` vs `<T>e`
    * e.p!
    * Not all assertions are valid

## Where Do Types Come From?

    * Built-in (lib.d.ts)
    * Inference
    * Your own types
    * Packaged types
    * DefinitelyTyped

