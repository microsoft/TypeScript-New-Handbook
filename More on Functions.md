 * Chapter 4: More on Functions
  * Function type expressions
  * Call/construct signatures
  * Generics
    * "Passing a value through"
      * Stress that a type parameter should always appear in 2 places
    * Generic constraints
    * Using `T` in the body
  * Overloads
    * How to write them
    * The implementation signature is not visible
    * When not to write them
      * Union types
      * Generics
      * Optional parameters
      * etc
  * Rest and destructuring parameters
    * Where do type annotations go?
  * Assignability of functions
  * Other types to know about
    * void, object, unknown, never, Function


# More on Functions

In JavaScript, functions are values that can be passed around.
Just like other values, TypeScript has many ways to describe these kinds of values.
Let's learn about how to write types that describe functions.

## Function Type Expressions

The simplest way to describe a function is with a a *function type expression*.
These types are syntactically similar to arrow functions:

```ts
function greeter(fn: (a: string) => void) {
    fn("Hello, World");
}
function printToConsole(s: string) {
    console.log(s);
}
greeter(printToConsole);
```

The syntax `(a: string) => void` means "a function with one parameter, named `a`, of type string, that doesn't have a return value".
Just like with function declarations, if a parameter type isn't specified, it's implicitly `any`.

> Note that the parameter name is **required**. The function type `(string) => void` means "a function with a parameter named `string` of type `a`".

Of course, we can use a type alias to name a function type:

```ts
type GreetFunction = (a: string) => void;
function greeter(fn: GreetFunction) {
    // ...
}
```

## Call Signatures

In JavaScript, functions can have properties in addition to being callable.
However, the function type expression syntax doesn't allow for declaring properties.
If we want to describe something callable with properties, we can write a *call signature* in an object type:

```ts
type DescribableFunction = {
    description: string;
    (someArg: number): boolean;
};
function doSomething(fn: DescribableFunction) {
    console.log(fn.description + " returned " + fn(6));
}
```

Note that the syntax is slightly different compared to a function type expression - use `:` between the parameter list and the return type rather than `=>`.

## Construct Signatures

JavaScript functions can also be invoked with the `new` operator.
TypeScript refers to these as *constructors* because they usually create a new object.
You can write a *construct signature* by adding the `new` keyword in front of a call signature:
```ts
type SomeObject = any;
//cut
type SomeConstructor = {
    new(s: string): SomeObject;
}
function fn(ctor: SomeConstructor) {
    return new ctor("hello");
}
```

Some objects, like JavaScript's `Date` object, can be called with or without `new`.
You can combine call and construct signatures in the same type arbitrarily:

```ts
interface CallOrConstruct {
    new(s: string): Date;
    (n?: number): number;
}
```

## Generic Functions




    * "Passing a value through"
      * Stress that a type parameter should always appear in 2 places
    * Generic constraints
    * Using `T` in the body



