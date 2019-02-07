<!-- Extremely WIP, do not review -->

# Everyday Types

In this chapter, we'll cover some of the most common types of values you'll find in JavaScript code, and explain the corresponding ways to describe those types in TypeScript.
This isn't an exhaustive list, and future chapters will describe more ways to name and use other types.

Types can also appear in many more *places* than just type annotations.
As we learn about the types themselves, we'll also learn about the places where we can refer to these types to form new constructs.

## Common Built-in Types

We'll start by reviewing the most basic and common types you might encounter when writing JavaScript or TypeScript code.
These will later form the core "building blocks" of more complex types.

### `string`, `number`, and `boolean`

JavaScript has three main [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) kinds of values: `string`, `number`, and `boolean`.
Each has a corresponding type in TypeScript.
As you might expect, these are the same names you'd see if you used the JavaScript `typeof` operator on a value of those types:

 * `string` represents string values like `"Hello, world"`
 * `number` is for numbers like `42`. JavaScript does not have a special runtime value for integers, so there's no equivalent to `int` or `float` - everything is simply `number`
 * `boolean` is for the two values `true` and `false`

> The type names `String`, `Number`, and `Boolean` are legal, but refer to some special built-in types that shouldn't appear in your code. *Always* use `string`, `number`, or `boolean`.

### Arrays

To specify the type of an array like `[1, 2, 3]`, you can use the syntax `number[]`; this syntax works for any type (e.g. `string[]` is an array of strings, and so on).
You may also see this written as `Array<number>`, which means the same thing.
We'll learn more about the syntax `T<U>` when we cover *generics*.

> Note that `[number]` is a different thing; refer to the section on *tuple types*.

### `any`

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

## Type Annotations on Variables

When you declare a variable using `const`, `var`, or `let`, you can optionally add a type annotation to explicitly specify the type of the variable:
```ts
let myName: string = "Alice";
//        ↑↑↑↑↑↑↑↑
```

> TypeScript doesn't use "types on the left"-style declarations like `int x = 0;`
> Type annotations will always go *after* the thing being typed.

In most cases, though, this isn't needed.
Wherever possible, TypeScript tries to automatically *infer* the types in your code.
For example, the type of a variable is inferred based on the type of its initializer:
```ts
// No type annotation needed -- 'myName' inferred as type 'string'
let myName = "Alice";
```

For the most part you don't need to explicitly learn the rules of inference.
If you're starting out, try using fewer type annotations than you think - you might be surprised how few you need for TypeScript to fully understand what's going on.

## Functions

Functions are the primary means of passing data around in JavaScript.
TypeScript allows you to specify the types of both the input and output values of functions.

### Parameter Type Annotations

When you declare a function, you can add type annotations after each parameter to declare what kinds of parameters the function accepts.
Parameter type annotations go after the parameter name:

```ts
// Parameter type annotation
function greet(name: string) {
//                 ↑↑↑↑↑↑↑↑
    console.log("Hello, " + name.toUpperCase() + "!!");
}
```

When a parameter has a type annotation, calls to that function will be validated:

```ts
declare function greet(name: string): void;
//cut
// Would be a runtime error if executed!
greet(42);
```

### Return Type Annotations

You can also add return type annotations.
Return type annotations appear after the parameter list:

```ts
function getFavoriteNumber(): number {
//                          ↑↑↑↑↑↑↑↑
    return 26;
}
```

Much like variable type annotations, you usually don't need a return type annotation because TypeScript will infer the function's return type based on its `return` statements.
The type annotation in the above example doesn't change anything.
Some codebases will explicitly specify a return type for documentation purposes, to prevent accidental changes, or just for personal preference. 

### Function Expressions

Function expressions are a little bit different from function declarations.
When a function expression appears in a place where TypeScript can determine how it's going to be called, the parameters of that function are automatically given types.

Here's an example:

```ts
// No type annotations here, but TypeScript can spot the bug
const names = ["Alice", "Bob", "Eve"];
names.forEach(function (s) {
    console.log(s.toUppercase());
});
```

Even though the parameter `s` didn't have a type annotation, TypeScript used the types of the `forEach` function, along with the inferred type of the array, to determine the type `s` will have.

This process is called *contextual typing* because the *context* that the function occurred in informed what type it should have.
Similar to the inference rules, you don't need to explicitly learn how this happens, but understanding that it *does* happen can help you notice when type annotations aren't needed.
Later, we'll see more examples of how the context that a value occurs in can affect its type.

## Object Types

Apart from primitives, the most common sort of type you'll encounter is an *object type*.
This refers to any JavaScript value with properties, which is almost all of them!
To define an object type, we simply list its properties and their types.

For example, here's a function that takes a point-like object:

```ts
// The parameter's type annotation is an object type
function printCoord(pt: { x: number, y: number }) {
  //                    ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });
```

Here, we annotated the parameter with a type with two properties - `x` and `y` - which are both of type `number`.
You can use `,` or `;` to separate the properties, and the last separator is optional either way.

The type part of each property is also optional.
If you don't specify a type, it will be assumed to be `any`.

This example used an object type *anonymously* - that is, without giving it a name.
This can be convenient, but more often, you'll want to give these types names so that you can refer to them in multiple places.

## Naming Object Types with Type Aliases or Interfaces

There are two ways to give a name to an object type, and they're very similar.

### Type Aliases

A *type alias* is exactly that - an *alias* for any *type*.
The syntax for a type alias is:

```ts
type Point = {
  x: number,
  y: number
};

// Exactly the same as the earlier example
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's x value is " + pt.y);
}
```

You can actually use a type alias to give a name to any type at all, not just an object type.
We'll see many examples of this later.

Note that aliases are *only* aliases - you cannot use type aliases to create different/distinct "versions" of the same type.
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
  x: number;
  y: number;
}
```

### Differences between Type Aliases and Interfaces

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

## Union Types

TypeScript's type system allows you to build new types out of existing ones using a large variety of operators.
Now that we know how to write a few types, it's time to start *combining* them in interesting ways.

### Defining a Union Type

The first way to combine types you might see is a *union* type.
A union type is type formed from a list of other types, representing a value that is *any one* of those types.
We refer to each of these types as the union's *members*.

Let's write a union type and give it an alias:
```ts
type ID = number | string;
```
This creates a new type name, `ID`, that means "*a value that is either a number or a string*".

We can then use this type to describe a function that accepts multiple kinds of input:
```ts
type ID = number | string;
//cut
function printId(id: ID) {
  console.log("Your ID is: " + id);
}
// OK
printId(101);
// OK
printId("202");
// Error
printId([1, 2]);
```

### Working with Union Types

It's easy to *provide* a value matching a union type - simply provide a type matching one of the union's members.
If you *have* a value of a union type, how do you work with it?

TypeScript will only allow you to do things with the union if that thing is valid for *every* member of the union.
For example, if you have the union `string | number`, you can't use methods that are only available on `string`:
```ts
function printId(id: number | string) {
  console.log(id.toUpperCase());
}
```

The solution is to *narrow* the union with code, the same as you would in JavaScript without type annotations.
*Narrowing* occurs when TypeScript can deduce a more specific type based on the structure of the code.

For example, TypeScript knows that only a `string` value will have a `typeof` value `"string"`:
```ts
function printId(id: number | string) {
  if (typeof id === "string") {
    // In this branch, id is of type 'string'
    console.log(id.toUpperCase());
  } else {
    // Here, id is of type 'number'
    console.log(id);
  }
}
```

Another example is to use a function like `Array#isArray`:
```ts
function welcomePeople(namesOrName: string[] | string) {
  if (Array.isArray(namesOrName)) {
    // Here: names is string[]
    console.log("Hello, " + namesOrName.join(" and "));
  } else {
    // Here: names is string
    console.log("Welcome lone traveler " + namesOrName);
  }
}
```
Notice that in the `else` branch, we don't need to do anything special - if the value wasn't a `string[]`, then it must have been a `string`.

Sometimes you'll have a union where all the members have something in common.
For example, both arrays and strings have a `slice` method.
If every member in a union has a property in common, you can use that property without narrowing:
```ts
// Return type is inferred as number[] | string
function getFirstThree(x: number[] | string) {
  return x.slice(0, 3);
}
```

> It might be confusing that a *union* of types appears to have the *intersection* of those types' properties.
> This is not an accident - the name *union* comes from type theory:
> The *union* `number | string` is composed by taking the union *of the values* from each type.
> Notice that given two sets with corresponding collections of facts about each set, only the *intersection* of those collections of facts applies to the *union* of the sets themselves.

## Type Assertions



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
  * Union Types
    * Simple concept: "This or that"
    * Unions of primitives
    * Introduce concept of type narrowing and demonstrate it with typeof
  * Type assertions
    * Sometimes you know more than the checker
    * `e as T` vs `<T>e`
    * Not all assertions are valid
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
  * Where do types come from?
    * Built-in (lib.d.ts)
    * Inference
    * Your own types
    * Packaged types
    * DefinitelyTyped
