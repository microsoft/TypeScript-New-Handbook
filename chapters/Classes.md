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

### `readonly` {#readonly-class-properties}

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

If you have a getter without a setter, the field is automatically `readonly`

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

You can use TypeScript to control whether certain methods or properties are visible to code outside the class.

### `public`

The default visibility of class members is `public`.
A `public` member can be accessed by anywhere:

```ts
class Greeter {
  public greet() {
    console.log("hi!");
  }
}
const g = new Greeter();
g.greet();
```

Because `public` is already the default visibility modifier, you don't ever *need* to write it on a class member, but might choose to do so for style/readability reasons.

### `protected`

`protected` members are only visible to subclasses of the class they're declared in.

```ts
class Greeter {
  public greet() {
    console.log("Hello, " + this.getName());
  }
  protected getName() {
    return "hi";
  }
}

class SpecialGreeter extends Greeter {
  public howdy() {
    // OK to access protected member here
    console.log("Howdy, " + this.getName());
                            ^^^^^^^^^^^^^^
  }
}
const g = new SpecialGreeter();
g.greet(); // OK
g.getName();
```

#### Exposure of `protected` members

Derived classes need to follow their base class contracts, but may choose to expose a more general type with more capabilities.
This includes making `protected` members `public`:

```ts
class Base {
  protected m = 10;
}
class Derived extends Base {
  // No modifier, so default is 'public'
  m = 15;
}
const d = new Derived();
console.log(d.m); // OK
```

Note that `Derived` was already able to freely read and write `m`, so this doesn't meaningfully alter the "security" of this situation.
The main thing to note here is that in the derived class, we need to be careful to repeat the `protected` modifier if this exposure isn't intentional.

#### Cross-hierarchy `protected` access

Different OOP languages disagree about whether it's legal to access a `protected` member through a base class reference:

```ts
class Base {
    protected x: number = 1;
}
class Derived1 extends Base {
    protected x: number = 5;
}
class Derived2 extends Base {
    f1(other: Derived2) {
        other.x = 10;
    }
    f2(other: Base) {
        other.x = 10;
    }
}
```

Java, for example, considers this to be legal.
On the other hand, C# and C++ chose that this code should be illegal.

TypeScript sides with C# and C++ here, because accessing `x` in `Derived2` should only be legal from `Derived2`'s subclasses, and `Derived1` isn't one of them.
Moreover, if accessing `x` through a `Derived2` reference is illegal (which it certainly should be!), then accessing it through a base class reference should never improve the situation.

See also [Why Can’t I Access A Protected Member From A Derived Class?](https://blogs.msdn.microsoft.com/ericlippert/2005/11/09/why-cant-i-access-a-protected-member-from-a-derived-class/) which explains more of C#'s reasoning.

### `private`

`private` is like `protected`, but doesn't allow access to the member even from subclasses:

```ts
class Base {
  private x = 0;
}
const b = new Base();
// Can't access from outside the class
console.log(b.x);
```

```ts
class Base {
  private x = 0;
}
//cut
class Derived extends Base {
  showX() {
    // Can't access in subclasses
    console.log(this.x);
  }
}
```

Because `private` members aren't visible to derived classes, a derived class can't increase its visibility:


```ts
class Base {
  private x = 0;
}
class Derived extends Base {
  x = 1;
}
```

#### Cross-instance `private` access

Different OOP languages disagree about whether different instances of the same class may access each others' `private` members.
While languages like Java, C#, C++, Swift, and PHP allow this, Ruby does not.

TypeScript does allow cross-instance `private` access:

```ts
class A {
  private x = 10;

  public sameAs(other: A) {
    // No error
    return other.x === this.x;
  }
}
```

#### Caveats {#private-and-runtime-privacy}

Like other aspects of TypeScript's type system, `private` and `protected` are only enforced during type checking.
This means that JavaScript runtime constructs like `in` or simple property lookup can still access a `private` or `protected` member:

```ts
class MySafe {
  private secretKey = 12345;
}
```

```js
// In a JavaScript file...
const s = new MySafe();
// Will print 12345
console.log(s.secretKey);
```

If you need to protect values in your class from malicious actors, you should use mechanisms that offer hard runtime privacy, such as closures, weak maps, or [[private fields]].

## Static Members

>> [Background Reading: Static Members (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)

Classes may have `static` members.
These members aren't associated with a particular instance of the class.
They can be accessed through the class constructor object itself:

```ts
class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}
console.log(MyClass.x);
MyClass.printX();
```

Static members can also use the same `public`, `protected`, and `private` visibility modifiers:

```ts
class MyClass {
  private static x = 0;
}
console.log(MyClass.x);
```

Static members are also inherited:

```ts
class Base {
  static getGreeting() {
    return "Hello world";
  }
}
class Derived extends Base {
  myGreeting = Derived.getGreeting();
}
```

### Special Static Names

Because classes are themselves functions that can be invoked with `new`, certain `static` names can't be used.
Function properties like `name`, `length`, and `call` aren't valid to define as `static` members:

```ts
class S {
  static name = "S!";
}
```

### Why No Static Classes?

TypeScript (and JavaScript) don't have a construct called `static class` the same way C# and Java do.

Those constructs *only* exist because those languages force all data and functions to be inside a class; because that restriction doesn't exist in TypeScript, there's no need for them.
A class with only a single instance is typically just represented as a normal *object* in JavaScript/TypeScript.

For example, we don't need a "static class" syntax in TypeScript because a regular object (or even top-level function) will do the job just as well:

```ts
// Unnecessary "static" class
class MyStaticClass {
    static doSomething() {

    }
}

// Preferred (alternative 1)
function doSomething() {

}

// Preferred (alternative 2)
const MyHelperObject = {
    dosomething() {

    }
}
```

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
