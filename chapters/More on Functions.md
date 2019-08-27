# More on Functions

Functions are the basic building block of any application, whether they're local functions, imported from another module, or methods on a class.
They're also values, and just like other values, TypeScript has many ways to describe how functions can be called.
Let's learn about how to write types that describe functions.

__toc__

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

> Note that the parameter name is **required**. The function type `(string) => void` means "a function with a parameter named `string` of type `a`"!

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

By adding a type parameter `T` to this function and using it in two places, we've created a link between the input of the function (the array) and the output (the return value).
Now when we call it, a more specific type comes out:

```ts
declare function firstElement<T>(arr: T[]): T;
//cut
// s is of type 'string'
const s = firstElement(["a", "b", "c"]);
// n is of type 'number'
const n = firstElement([1, 2, 3]);
```

### Inference

Note that we didn't have to specify `T` in this sample.
The type was *inferred* - chosen automatically - by TypeScript.

We can use multiple type parameters as well.
For example, a standalone version of `map` would look like this:

```ts
function map<E, O>(arr: E[], func: (arg: E) => O): O[] {
  return arr.map(func);
}

// Parameter 'n' is of type 'number'
// 'parsed' is of type 'string[]'
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
// Error! Numbers don't have a 'length' property
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
The problem is that the function promises to return the *same* kind of object as was passed in, not just *some* object matching the constraint.
If this code were legal, you could write code that definitely wouldn't work:

```ts
declare function minimumLength<T extends { length: number }>(obj: T, minimum: number): T;
//cut
// 'arr' gets value { length: 6 }
const arr = minimumLength([1, 2, 3], 6);
// and crashes here because arrays have
// a 'slice' method, but not the returned object!
console.log(arr.slice(0));
```

### Specifying Type Arguments

TypeScript can usually infer the intended type arguments in a generic call, but not always.
For example, let's say you wrote a function to combine two arrays:

```ts
function combine<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.concat(arr2);
}
```

Normally it would be an error to call this function with mismatched arrays:

```ts
declare function combine<T>(arr1: T[], arr2: T[]): T[];
//cut
const arr = combine([1, 2, 3], ["hello"]);
```

If you intended to do this, however, you could manually specify `T`:

```ts
declare function combine<T>(arr1: T[], arr2: T[]): T[];
//cut
const arr = combine<string | number>([1, 2, 3], ["hello"]);
```

### Guidelines for Writing Good Generic Functions

Writing generic functions is fun, and it can be easy to get carried away with type parameters.
Having too many type parameters or using constraints where they aren't needed can make inference less successful, frustrating callers of your function.

#### Push Type Parameters Down

Here are two ways of writing a function that appear similar:

```ts
function firstElement1<T>(arr: T[]) {
  return arr[0];
}

function firstElement2<T extends any[]>(arr: T) {
  return arr[0];
}

// a: number (good)
const a = firstElement1([1, 2, 3]);
// b: any (bad)
const b = firstElement2([1, 2, 3]);
```

These might seem identical at first glance, but `firstElement1` is a much better way to write this function.
Its inferred return type is `T`, but `firstElement2`'s inferred return type is `any` because TypeScript has to resolve the `arr[0]` expression using the constraint type, rather than "waiting" to resolve the element during a call.

> **Rule**: When possible, use the type parameter itself rather than constraining it

#### Use Fewer Type Parameters

Here's another pair of similar functions:

```ts
function filter1<T>(arr: T[], func: (arg: T) => boolean): T[] {
    return arr.filter(func);
}

function filter2<T, F extends (arg: T) => boolean>(arr: T[], func: F): T[] {
    return arr.filter(func);
}
```

We've created a type parameter `F` that *doesn't relate two values*.
That's always a red flag, because it means callers wanting to specify type arguments have to manually specify an extra type argument for no reason.
`F` doesn't do anything but make the function harder to read and reason about!

> **Rule**: Always use as few type parameters as possible

#### Type Parameters Should Appear Twice

Sometimes we forget that function doesn't need to be generic:

```ts
function greet<S extends string>(s: S) {
  console.log("Hello, " + s);
}

greet("world");
```

We could just as easily have written a simpler version:

```ts
function greet(s: string) {
  console.log("Hello, " + s);
}
```

Remember, type parameters are for *relating the types of multiple values*.
If a type parameter is only used once in the function signature, it's not relating anything.

> **Rule**: If a type parameter only appears in one location, strongly reconsider if you actually need it

## Optional Parameters

Functions in JavaScript often take a variable number of arguments.
For example, the `toFixed` method of `number` takes an optional digit count:

```ts
function f(n: number) {
  console.log(n.toFixed()); // 0 arguments
  console.log(n.toFixed(3)); // 1 argument
}
```

We can model this in TypeScript by marking the parameter as *optional* with `?`:

```ts
function f(x?: number) {
  // ...
}
f(); // OK
f(10); // OK
```

Although the parameter is specified as type `number`, the `x` parameter will actually have the type `number | undefined` because unspecified parameters in JavaScript get the value `undefined`.

You can also provide a parameter *default*:

```ts
function f(x = 10) {
  // ...
}
```

Now in the body of `f`, `x` will have type `number` because any `undefined` argument will be replaced with `10`.
Note that when a parameter is optional, callers can always pass `undefined`, as this simply simualtes a "missing" argument:

```ts
declare function f(x?: number): void;
// cut
// All OK
f();
f(10);
f(undefined);
```

### Optional Parameters in Callbacks

Once you've learned about optional parameters and function type expressions, it's very easy to make the following mistakes when writing functions that invoke callbacks:

```ts
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
}
```

What people usually *intend* when writing `index?` as an optional parameter is that they want both of these calls to be legal:

```ts
declare function myForEach(arr: any[], callback: (arg: any, index?: number) => void): void
//cut
myForEach([1, 2, 3], a => console.log(a));
myForEach([1, 2, 3], (a, i) => console.log(a, i));
```

What this *actually* means is that *`callback` might get invoked with one argument*.
In other words, the function definition says that the implementation might look like this:

```ts
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    // I don't feel like providing the index today
    callback(arr[i]);
  }
}
```

In turn, TypeScript will enforce this meaning and issue errors that aren't really possible:

```ts
declare function myForEach(arr: any[], callback: (arg: any, index?: number) => void): void
//cut
myForEach([1, 2, 3], (a, i) => {
  console.log(i.toFixed());
});
```

In JavaScript, if you call a function with more arguments than there are parameters, the extra arguments are simply ignored.
TypeScript behaves the same way.
Functions with fewer parameters (of the same types) can always take the place of functions with more parameters.

> When writing a function type for a callback, *never* write an optional parameter unless you intend to *call* the function without passing that argument

## Function Overloads

Some JavaScript functions can be called in a variety of argument counts and types.
For example, you might write a function to produce a `Date` that takes either a timestamp (one argument) or a month/day/year specification (three arguments).

In TypeScript, we can specify a function that can be called in different ways by writing *overload signatures*.
To do this, write some number of function signatures (usually two or more), followed by the body of the function:

```ts
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
const d3 = makeDate(1, 3);
```

In this example, we wrote two overloads: one accepting one argument, and another accepting three arguments.
These first two signatures are called the *overload signatures*.

Then, we wrote a function implementation with a compatible signature.
Functions have an *implementation* signature, but this signature can't be called directly.
Even though we wrote a function with two optional parameters after the required one, it can't be called with two parameters!

### Overload Signatures and the Implementation Signature

This is a common source of confusion.
Often people will write code like this and not understand why there is an error:

```ts
function fn(x: string): void;
function fn() {
  // ...
}
// Expected to be able to call with zero arguments
fn();
```

Again, the signature used to write the function body can't be "seen" from the outside.

> The signature of the *implementation* is not visible from the outside.
> When writing an overloaded function, you should always have *two* or more signatures above the implementation of the function.

The implementation signature must also be *compatible* with the overload signatures.
For example, these functions have errors because the implementation signature doesn't match the overloads in a correct way:

```ts
function fn(x: boolean): void;
// Argument type isn't right
function fn(x: string): void;
function fn(x: boolean) {

}
```

```ts
function fn(x: string): string;
// Return type isn't right
function fn(x: number): boolean;
function fn(x: string | number) {
  return "oops";
}
```

### Writing Good Overloads

Like generics, there are a few guidelines you should follow when using function overloads.
Following these principles will make your function easier to call, easier to understand, and easier to implement.

Let's consider a function that returns the length of a string or an array:

```ts
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any) {
  return x.length;
}
```

This function is fine; we can invoke it with strings or arrays.
However, we can't invoke it with a value that might be a string *or* an array, because TypeScript can only resolve a function call to a single overload:

```ts
declare function len(s: string): number;
declare function len(arr: any[]): number;
//cut
len(""); // OK
len([0]); // OK
len(Math.random() > 0.5 ? "hello" : [0]);
```

Because both overloads have the same argument count and same return type, we can instead write a non-overloaded version of the function:

```ts
function len(x: any[] | string) {
  return x.length;
}
```

This is much better!
Callers can invoke this with either sort of value, and as an added bonus, we don't have to figure out a correct implementation signature.

> Always prefer parameters with union types instead of overloads when possible

## Other Types to Know About

There are some additional types you'll want to recognize that appear often when working with function types.
Like all types, you can use them everywhere, but these are especially relevant in the context of functions.

### `void`

`void` represents the return value of functions which don't return a value.
It's the inferred type any time a function doesn't have any `return` statements, or doesn't return any explicit value from those return statements:

```ts
// The inferred return type is void
function noop() {
  return;
}
```

In JavaScript, a function that doesn't return any value will implicitly return the value `undefined`.
However, `void` and `undefined` are not the same thing in TypeScript.
See the reference page [[Why Void Is A Special Type]] for a longer discussion about this.

> `void` is not the same as `undefined`.

### `object`

The special type `object` refers to any value that isn't a primitive (`string`, `number`, `boolean`, `symbol`, `null`, or `undefined`).
This is different from the *empty object type* `{ }`, and also different from the global type `Object`.
You can read the reference page about [[The Global Types]] for information on what `Object` is for - long story short, don't ever use `Object`.

> `object` is not `Object`. **Always** use `object`!

Note that in JavaScript, function values are objects: They have properties, have `Object.prototype` in their prototype chain, are `instanceof Object`, you can call `Object.keys` on them, and so on.
For this reason, function types are considered to be `object`s in TypeScript.

### `unknown`

The `unknown` type represents *any* value.
This is similar to the `any` type, but is safer because it's not legal to do anything with an `unknown` value:

```ts
function f1(a: any) {
  a.b(); // OK
}
function f2(a: unknown) {
  a.b();
}
```

This is useful when describing function types because you can describe functions that accept any value without having `any` values in your function body.

Conversely, you can describe a function that returns a value of unknown type:

```ts
declare const someRandomString: string;
//cut
function safeParse(s: string): unknown {
  return JSON.parse(s);
}

// Need to be careful with 'obj'!
const obj = safeParse(someRandomString);
```

### `never`

Some functions *never* return a value:

```ts
function fail(msg: string): never {
  throw new Error(msg);
}
```

The `never` type represents values which are *never* observed.
In a return type, this means that the function throws an exception or terminates execution of the program.

`never` also appears when TypeScript determines there's nothing left in a union.

```ts
function fn(x: string | number) {
  if (typeof x === "string") {
    // do something
  } else if (typeof x === "number") {
    // do something else
  } else {
    x; // has type 'never'!
  }
}
```

### `Function` {#the-global-function-type}

The global type `Function` describes properties like `bind`, `call`, `apply`, and others present on all function values in JavaScript.
It also has the special property that values of type `Function` can always be called; these calls return `any`:

```ts
function doSomething(f: Function) {
  f(1, 2, 3);
}
```

This is an *untyped function call* and is generally best avoided because of the unsafe `any` return type.

If need to accept an arbitrary function but don't intend to call it, the type `() => void` is generally safer.

## Rest Parameters and Arguments

**Background reading**: [Rest Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) and [Spread Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

### Rest Parameters

In addition to using optional parameters or overloads to make functions that can accept a variety of fixed argument counts, we can also define functions that take an *unbounded* number of arguments using *rest parameters*.

A rest parameter appears after all other parameters, and uses the `...` syntax:

```ts
function multiply(n: number, ...m: number[]) {
  return m.map(x => n * x);
}
// 'a' gets value [10, 20, 30, 40]
const a = multiply(10, 1, 2, 3, 4);
```

In TypeScript, the type annotation on these parameters is implicitly `any[]` instead of `any`, and any type annotation given must be of the form `Array<T> `or `T[]`, or a tuple type (which we'll learn about later).

### Rest Arguments

Conversely, we can *provide* a variable number of arguments from an array using the spread syntax.
For example, the `push` method of arrays takes any number of arguments:

```ts
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
arr1.push(...arr2);
```

Note that in general, TypeScript does not assume that arrays are immutable.
This can lead to some surprising behavior:

```ts
// Inferred type is number[] -- "an array with zero or more numbers",
// not specfically two numbers
const args = [8, 5];
const angle = Math.atan2(...args);
```

The best fix for this situation depends a bit on your code, but in general a `const` context is the most straightforward solution:

```ts
// Inferred as 2-length tuple
const args = [8, 5] as const;
// OK
const angle = Math.atan2(...args);
```

<!-- TODO link to downlevel iteration -->

## Parameter Destructuring

>> **Background reading**: [Destructuring Assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

You can use parameter destructuring to conveniently unpack objects provided as an argument into one or more local variables in the function body.
In JavaScript, it looks like this:

```js
function sum({ a, b, c }) {
  console.log(a + b + c);
}
sum({ a: 10, b: 3, c: 9 });
```

The type annotation for the object goes after the destructuring syntax:

```ts
function sum({ a, b, c }: { a: number, b: number, c: number }) {
  console.log(a + b + c);
}
```

This can look a bit verbose, but you can use a named type here as well:

```ts
// Same as prior example
type ABC = { a: number, b: number, c: number };
function sum({ a, b, c }: ABC) {
  console.log(a + b + c);
}
```

## Assignability of Functions
