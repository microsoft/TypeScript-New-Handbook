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

It's common to write a function where the types of the input relate to the type of the output, or where the types of two inputs are related in some way.
Let's consider for a moment a function that returns the first element of an array:

```ts
function firstElement(arr: any[]) {
  return arr[0];
}
```

This function does its job, but unfortunately has the return type `any`.
It'd be better if the function returned the type of the array element.

In TypeScript, *generics* are used when we want to describe a correspondence between two values.
We do this by declaring a *type parameter* in the function signature:

```ts
function firstElement<T>(arr: T[]): T {
  return arr[0];
}
```

### Inference

By adding a type parameter `T` to this function and using it in two places, we've created a link between the input of the function (the array) and the output (the return value).
Now when we call it, a more specific type comes out:

```ts
declare function firstElement<T>(arr: T[]): T;
//cut
// s is of type 'string'
const s = firstElement(["a", "b", "c"]);
```

Note that we didn't have to specify `T` in this sample.
The type was *inferred* - chosen automatically - by TypeScript.

We can use multiple type parameters as well.
For example, a standalone version of `map` would look like this:

```ts
function map<E, O>(arr: E[], func: (arg: E) => O): O[] {
  return arr.map(func);
}

// n is of type 'number'
// parsed is of type 'string[]'
const parsed = map(["1", "2", "3"], n => parseInt(n));
```

Note that in this example, TypeScript could infer both the type of the `E` type parameter (from the given `string` array), as well as the type `O` based on the return value of the function expression.

### Constraints

We've written some generic functions that can work on *any* kind of value.
Sometimes we want to relate two values, but can only operate on a certain subset of values.
In this case, we can use a *constraint* to limit the kinds of types that a type parameter can accept.

Let's write a function that returns the longer of two values.
To do this, we need a `length` property that's a number.
We *constrain* the type parameter to that type by writing an `extends` clause:
```ts
function longest<T extends { length: number }>(a: T, b: T) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}

// longerArray is of type 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);
// longerString is of type 'string'
const longerString = longest("alice", "bob");
// Error!
const notOK = longest(10, 100);
```

There are a interesting few things to note in this example.
We allowed TypeScript to *infer* the return type of `longest`.
Return type inference also works on generic functions.

Because we constrained `T` to `{ length: number }`, we were allowed to access the `.length` property of the `a` and `b` parameters.
Without the type constraint, we wouldn't be able to access those properties because the values might have been some other type without a length property.

The types of `longerArray` and `longerString` were inferred based on the arguments.
Remember, generics are all about relating two or more values with the same type!

Finally, just as we'd like, the call to `longest(10, 100)` is rejected because the `number` type doesn't have a `.length` property.

### Working with Constrained Values

Here's a common error when working with generic constraints:

```ts
function minimumLength<T extends { length: number }>(obj: T, minimum: number): T {
  if (obj.length >= minimum) {
    return obj;
  } else {
    return { length: minimum };
  }
}
```

It might look like this function is OK - `T` is constrained to `{ length: number }`, and the function either returns `T` or a value matching that constraint.
The problem is that the function promises to 



    * "Passing a value through"
      * Stress that a type parameter should always appear in 2 places
    * Generic constraints
    * Using `T` in the body



