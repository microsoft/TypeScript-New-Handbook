<!-- Extremely WIP, do not review -->

# Basic Types

In this chapter, we'll cover some of the most common types of values you'll find in JavaScript code, and explain the corresponding ways to describe those types in TypeScript.
This isn't an exhaustive list, and future chapters will describe more ways to name other types.

## Primitives

Each primitive type in JavaScript has a corresponding type in TypeScript. As you might expect, these are the same names you'd see if you used the JavaScript `typeof` operator on a value of those types:

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

The `any` type is useful when you don't want to write out a long type just to convince TypeScript that a particular line of code is okay.

## Inference

Wherever possible, TypeScript tries to automatically *infer* the types in your code.

For example, the type of a variable is *inferred* based on the type of its initializer:
```ts
// myName: string
let myName = "Alice";
```
This means that in most places, you don't need to write type annotations.

This inference process happens automatically, but you can be more explicit if you'd like:
```ts
// Equivalent to the prior example
let myName: string = "Alice";
```

For the most part you don't need to explicitly learn the rules of inference.
If you're starting out, try using fewer type annotations than you think - you might be surprised how few you actually need for TypeScript to actually fully understand what's going on.

## Function Declarations

Functions are the primary means of passing data around in JavaScript.
TypeScript allows you to specify the types of both the input and output values of functions.

Parameter type annotations go after the parameter name:
```ts
// Parameter type annotation
function greet(name: string) {
    console.log("Hello, " + name.toUpperCase() + "!!");
}
```

Return type annotations go after the parameter list:
```ts
function getFavoriteNumber(): number {
    return 26;
}
```
If there isn't a return type annotation, the return type of a function will be inferred from the function's `return` statements (in other words, the annotation in the above sample doesn't change anything). Whether or not you include a return type annotation is usually personal preference.

## Function Expressions

Function expressions are a little bit different from function declarations.
When a function expression appears in a place where TypeScript can determine how it's going to be called, the parameters of that function are automatically given types.

Here's a concrete example:
```ts
const names = ["Alice", "Bob", "Eve"];
names.forEach(function (n) {
    console.log(n.toUppercase());
});
```
Even though the parameter `n` didn't have a type annotation, TypeScript used the type of the `forEach` function to determine the type it should have.

This process is called *contextual typing* because the *context* that the function occurred in informed what type it should have.
Later, we'll see more examples of how the context that a value occurs can modify its type.

## Object Types

The most common sort of type you'll encounter is an *object type*.
This refers to any JavaScript value with properties, which is almost all of them!
The syntax for an object type is a list of properties inside `{ }`.

For example, here's a function that takes a point-like object:
```ts
// The parameter's type annotation is an object type
function printCoord(pt: { x: number, y: number }) {
  //                    ________________________

  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });
```
Here, we annotated the parameter with a type with two properties - `x` and `y` - which are both of type `number`.
You can use `,` or `;` to separate the properties, and the last separator is optional either way.

This example used an object type *anonymously*, that is, without giving it a name.
This can be convenient, but more often, you'll want to give these types names so that you can refer to them in multiple places.

## Naming Object Types with Type Aliases or Interfaces

There are two ways to give a name to an object type, and they're very similar.

### Type Aliases

A *type alias* is exactly that - an *alias* for any *type*.
The syntax for a type alias is:
```ts
type Point = {
  x: number;
  y: number;
};

// Exactly the same as the earlier example
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's x value is " + pt.y);
}
```

You can actually use a type alias to give a name to any type at all, not just an object type.
We'll see many examples of this later.

Note that aliases are *only* aliases - you cannot use type aliases to create "different" versions of the same type.
When you use the alias, it's exactly as if you had written the aliased type.
In other words, this code might *look* illegal, but is OK according to TypeScript because both types are aliases for the same type:
```ts
type Age = number;
type Weight = number;

const myAge: Age = 73;
const myWeight: Weight = myAge; // *not* an error
```

### Interfaces

An *interface declaration* is another way to make an object type:
```ts
// Using commas instead of semicolons for variety, but either would work
interface Point {
  x: number,
  y: number
}
```

### Differences

Type aliases and interfaces are very similar, and in many cases you can choose between them freely.
Here are the most relevant differences between the two that you should be aware of.
You'll learn more about these concepts in later chapters, so don't worry if you don't understand all of these right away.

 * Classes can implement interfaces, but not type aliases
 * Interfaces may be `extend`ed, but not type aliases
 * Type aliases may not participate in declaration merging, but interfaces can
 * Interfaces may only be used to declare object types
 * Interface names will *always* appear in their original form in error messages, and *only* when they are used by name
 * Type alias names *may* appear in error messages, including where they are an exact match for an anonymous type

For the most part, you can choose based on personal preference, and TypeScript will tell you if it needs something to be the other kind of name.

## Optional Properties




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
