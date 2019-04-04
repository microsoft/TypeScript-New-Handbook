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



### Methods

### Getters / Setters

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

## Relationships Between Classes

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
