# Classes

[Background reading: Classes (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

TypeScript offers full support for the `class` keyword introduced in ES2015.
As with other JavaScript language features, TypeScript adds type annotations and other syntax to allow you to express relationships between classes and other types.

__toc__

## Class Members

Here's the most basic class - an empty one:

```ts
class Point {

}
```

This class isn't very useful yet, so let's start adding some members.

### Fields

A field declaration creates a public writeable property on a class:

```ts
// @strictPropertyInitialization: false
class Point {
    x: number;
    y: number;
}

const pt = new Point();
pt.x = 0;
pt.y = 0;
```

As with other locations, the type annotation is optional, but will be an implict `any` if not specified.

Fields can also have *initializers*; these will run automatically when the class is instantiated:
```ts
class Point {
    x = 0;
    y = 0;
}

const pt = new Point();
// Prints 0, 0
console.log(`${pt.x}, ${pt.y}`);
```

Just like with `const`, `let`, and `var`, the initializer of a class property will be used to infer its type:

```ts
class Point {
    x = 0;
    y = 0;
}
//cut
const pt = new Point();
pt.x = "0";
```

#### `--strictPropertyInitialization`

The `--strictPropertyInitialization` setting (in the `strict` family, see [[--strict]]) controls whether class fields need to be initialized in the constructor.

```ts
class BadGreeter {
  name: string;
}
```

```ts
class GoodGreeter {
  name: string;

  constructor() {
    this.name = "hello";
  }
}
```

Note that the field needs to be initialized *in the constructor itself*.
TypeScript does not analyze methods you invoke from the constructor to detect initializations, because a derived class might override those methods and fail to initialize the members.

If you intend to definitely initialize a field through means other than the constructor (for example, maybe an external library is filling in part of your class for you), you can use the *definite assignment assertion operator*, `!`:

```ts
class OKGreeter {
  // Not initialized, but no error
  name!: string;
}
```

#### `readonly`

Fields may be prefixed with the `readonly` modifier.
This prevents assignments to the field outside of the constructor.

```ts
class Greeter {
  readonly name: string = "world";

  constructor(otherName?: string) {
    if (otherName !== undefined) {
      this.name = otherName;
    }
  }

  err() {
    this.name = "not ok";
  }
}
const g = new Greeter();
g.name = "also not ok";
```

### Constructors

[Background Reading: Constructor (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor)

Class constructors are very similar to functions.
You can add parameters with type annotations, default values, and overloads:

```ts
class Point {
  x: number;
  y: number;

  // Normal signature with defaults
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

```ts
class Point {
  // Overloads
  constructor(x: number, y: string);
  constructor(s: string);
  constructor(xs: any, y?: any) {
    // TBD
  }
}
```

There are just a few differences between class constructor signatures and function signatures:
 * Constructors can't have type parameters - these belong on the outer class declaration, which we'll learn about later
 * Constructors can't have return type annotations - the class instance type is always what's returned

#### Super Calls

Just as in JavaScript, if you have a base class, you'll need to call `super();` in your constructor body before using any `this.` members:

```ts
class Base {
  k = 4;
}

class Derived extends Base {
  constructor() {
    // Prints a wrong value in ES5; throws exception in ES6
    console.log(this.k);
    super();
  }
}
```

Forgetting to call `super` is an easy mistake to make in JavaScript, but TypeScript will tell you when it's necessary

### Methods

[Background Reading: Method definitions (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)

Methods can use all the same type annotations as functions and constructors:

```ts
class Point {
  x = 10;
  y = 10;

  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
}
```

Other than the standard type annotations, TypeScript doesn't add anything else new to methods.

Note that inside a method body, it is still mandatory to access fields and other methods via `this.`.
An unqualified name in a method body will always refer to something in the enclosing scope:

```ts
let x: number = 0;

class C {
  x: string = "hello";

  m() {
    // This is trying to modify 'x' from line 1, not the class property
    x = "world";
  }
}
```

### Getters / Setters

Classes can also have *accessors*:

```ts
class C {
  _length = 0;
  get length() {
    return this._length;
  }
  set length(value) {
    this._length = value;
  }
}
```

> Note that a field-backed get/set pair with no extra logic is very rarely useful in JavaScript.
> It's fine to expose public fields if you don't need to add additional logic during the get/set operations.

TypeScript has some special inference rules for accessors:
 * If no `set` exists, the property is automatically `readonly`
 * The type of the setter parameter is inferred from the return type of the getter
 * If the setter parameter has a type annotation, it must match the return type of the getter
 * Getters and setters must have the same [[Member Visibility]]

It is not possible to have accessors with different types for getting and setting.

### Index Signatures

## Class Heritage

### `implements` Clauses

### `extends` Clauses

#### Cautions

#### Inheriting Built-in Types

## Member Visibility

(syntax)

### `public`

### `protected`

### `private`

## Static Members

## Generic Classes

### Type Parameters in Static Members

## `this` in Classes {#this-in-classes}

### `this` Types

### Managing `this`

### `--strictThis`

## Parameter Properties


## Class Expressions

## `abstract` Classes and Methods

## Relationships Between Classes

## Constructor Functions and Instance Types

## Handling Generic Constructors


## Impact of the Class Fields Proposal



  * Basics
    * Hey it's just ES6
    * Methods and properties
  * Class heritage
    * inherits
      * ES6 thing again
      * We don't have inherited typing yet
      * Inheriting from Error / Array / etc
    * implements
      * Again, just a check
      * Be wary of anys
  * public, private, protected
  * Generics
  * Static
    * Instance type parameters
  * Managing `this`
    * Arrow functions
    * `this` parameters
    * The `this` type
    * `this`-related flags
  * Parameter properties
