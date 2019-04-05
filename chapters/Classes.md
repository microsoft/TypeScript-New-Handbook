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

The [[strictPropertyInitialization]] setting controls whether class fields need to be initialized in the constructor.

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

Forgetting to call `super` is an easy mistake to make in JavaScript, but TypeScript will tell you when it's necessary.

### Methods

>> [Background Reading: Method definitions (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)

A function property on a class is called a *method*.
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

### Index Signatures {#class-index-signatures}

Classes can declare index signatures; these work the same as [[Index Signatures]] for other object types:

```ts
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);
  check(s: string) {
    return this[s] as boolean;
  }
}
```

Because the index signature type needs to also capture the types of methods, it's not easy to usefully use these types.
Generally it's better to store indexed data in another place instead of on the class instance itself.

## Class Heritage

Like other langauges with object-oriented features, classes in JavaScript can inherit from base classes.

### `implements` Clauses

You can use an `implements` clause to check that a class satisfies a particular `interface`.
An error will be issued if a class fails to correctly implement it:

```ts
interface Pingable {
  ping(): void;
}

class Sonar implements Pingable {
  ping() {
    console.log('ping!');
  }
}

class Ball implements Pingable {
  pong() {
    console.log('pong!');
  }
}
```

Classes may also implement multiple interfaces, e.g. `class C implements A, B {`.

#### Cautions

It's important to understand that an `implements` clause is only a check that the class can be treated as the interface type.
It doesn't change the type of the class or its methods *at all*.
A common source of error is to assume that an `implements` clause will change the class type - it doesn't!

```ts
// @noImplicitAny: false
interface Checkable {
  check(name: string): boolean;
}
class NameChecker implements Checkable {
  check(s) {
    // Notice no error here
    return s.toLowercse() === "ok";
           ^?
  }
}
```

In this example, we perhaps expected that `s`'s type would be influenced by the `name: string` parameter of `check`.
It is not - `implements` clauses don't change how the class body is checked or its type inferred.

Similarly, implementing an interface with an optional property doesn't create that property:

```ts
interface A {
  x: number;
  y?: number;
}
class C implements A {
  x = 0;
}
const c = new C();
c.y = 10;
```

### `extends` Clauses

>> [Background Reading: extends keyword (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends)

Classes may `extend` from a base class.
A derived class has all the properties and methods of its base class, and also define additional members.

```ts
class Animal {
  move() {
    console.log("Moving along!");
  }
}

class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) {
      console.log("woof!");
    }
  }
}

const d = new Dog();
// Base class method
d.move();
// Derived class method
d.woof(3);
```

#### Overriding Methods

>> [Background reading: super keyword (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super)

A derived class can also override a base class field or property.
You can use the `super.` syntax to access base class methods.
Note that because JavaScript classes are a simple lookup object, there is no notion of a "super field".

TypeScript enforces that a derived class is always a subtype of its base class.

For example, here's a legal way to override a method:
```ts
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  greet(name?: string) {
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}

const d = new Derived();
d.greet();
d.greet("reader");
```

It's important that a derived class follow its base class contract.
Remember that it's very common (and always legal!) to refer to a derived class instance through a base class reference:

```ts
class Base {
  greet() {
    console.log("Hello, world!");
  }
}
declare const d: Base;
//cut
// Alias the derived instance through a base class reference
const b: Base = d;
// No problem
b.greet();
```

What if `Derived` didn't follow `Base`'s contract?

```ts
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  // Make this parameter required
  greet(name: string) {
    console.log(`Hello, ${name.toUpperCase()}`);
  }
}
```

If we compiled this code despite the error, this sample would then crash:

```ts
declare class Base  { greet(): void };
declare class Derived extends Base { }
//cut
const b: Base = new Derived();
// Crashes because "name" will be undefined
b.greet();
```

#### Initialization Order and Virtual Behavior



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
