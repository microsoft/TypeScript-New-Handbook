<!-- Extremely WIP, do not review -->

# Basic Types

In this chapter, we'll cover some of the most common types of values you'll find in JavaScript code, and explain the corresponding ways to describe those types in TypeScript.
This isn't an exhaustive list, and future chapters will describe more ways to name other types.

## Primitives

Each primitive type in JavaScript has a corresponding type in TypeScript. As you might expect, these are the same names you'd see if you used the `typeof` operator on a corresponding value:

 * `string` represents string values like `"Hello, world"`
 * `number` is for numbers like `42`. JavaScript does not have a special runtime value for integers, so there's no equivalent to `int` or `float` - everything is simply `number`
 * `boolean` is for `true` and `false`

> The type names `String`, `Number`, and `Boolean` are legal, but refer to some special built-in types that shouldn't appear in your code. *Always* use `string`, `number`, or `boolean`.

## Arrays

To specify the type of an array like `[1, 2, 3]`, you can use the syntax `number[]`; this syntax works for any type (`string[]` is an array of strings, and so on). This is equivalent to writing `Array<number>` - `Array` is a built-in generic type, and we'll learn more about generics later.

Note that `[number]` is a different thing; see the later chapter on *tuple types*.

## `any`

TypeScript also has a special type, `any`, that you can use whenever you don't want a particular value to cause typechecking errors.

When a value is of type `any`, you can access any properties of it (which will in turn be of type `any`), call it like a function, assign it to (or from) a value of any type, or pretty much anything else that's syntactically legal:
```ts
let obj: any = { x: 0 };
// None of these lines of code are errors
obj.foo();
obj();
obj.bar = 100;
obj = "hello";
const n: number = obj;
```

<!-- Why use any? -->


## Inference

<!-- this section is bad -->

When you initialize a variable with a value, TypeScript infers the type of that variable based on the initializer, and prevents changes to the type of that variable later on.

For example, this code is assumed to be an error, because changing the type of a variable from `string` to a function is usually not what you meant to do:
```ts
let myName = "Alice";
// Forgot to call the function!
myName = myName.toUpperCase;
```
This inference process happens automatically, but you can be more explicit if you'd like:
```ts
// Equivalent to the first line of the prior sample
let myName: string = "Alice";
```

## Function Declarations

Functions are the primary means of passing data around in JavaScript. TypeScript allows you to specify the types of both the input and output values of functions.

Parameter type annotations go after the parameter name:
```ts
// Parameter type annotation
function greet(name: string) {
    console.log("Hello, " + name.toUpperCase() + "!!");
}
```
Note that for a function *declaration*, parameter types are never inferred.

Return type annotations go after the parameter list:
```ts
function getFavoriteNumber(): number {
    return 26;
}
```
If there isn't a return type annotation, the return type of a function will be inferred from the function's `return` statements (in other words, the annotation in the above sample doesn't change anything). Whether or not you include a return type annotation is usually personal preference.

## Function Expressions

Function expressions are a little bit different from function declarations. When a function expression appears in a place where TypeScript can determine how it's going to be called, the parameters of that function can be automatically given types.

Here's a concrete example:
```ts
const names = ["Alice", "Bob", "Eve"];
names.forEach(function (n) {
    console.log(n.toUppercase())
});
```
Even though the parameter `n` didn't have a type annotation, TypeScript used the type of the `forEach` function to determine the type it should have.

This process is called *contextual typing* because the *context* that the function occurred in informed what type it should have. Later, we'll see more examples of how the context that a value occurs can modify its type.

## Function Types



# Outline

 * Chapter 2: Everyday Types
  * Built-in Types
    * string, number, boolean, any, and array
    * Show inference and rules
      * Examples of allowed and disallowed operations
    * Type annotations on variable declarations
  * Functions
    * Parameter type annotations
    * Return type annotations and inference
    * Inference in function expressions
  * Object Types
    * Anonymous object types
    * Type aliases and Interfaces
    * Optional properties
  * Union Types
    * Simple concept: "This or that"
    * Unions of primitives
    * Introduce concept of type narrowing and demonstrate it with typeof
  * Literal Types
    * String literals
    * Numeric literals
    * Boolean's just an alias for `true` | `false`
    * Combine these with unions for e.g. `"GET" | "POST"`
    * Why do I have to sometimes write `"foo" as "foo"`
  * null and undefined
    * --strictNullChecks: turn it on
    * Undefined in optional parameters and properties
    * Demonstrate basic narrowing to check for them
    * Postfix unary `!`
  * Type assertions
    * Sometimes you know more than the checker
    * `e as T` vs `<T>e`
    * Not all assertions are valid
  * Where do types come from?
    * Built-in (lib.d.ts)
    * Inference
    * Your own types
    * Packaged types
    * DefinitelyTyped
