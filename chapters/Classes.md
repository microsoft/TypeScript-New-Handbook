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

```ts
//@strictPropertyInitialization: false
class Point {
    x: number;
    y: number;
}
```


### Constructors

### Methods

### Getters / Setters

### Index Signatures

#### `--strictPropertyInitialization`

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
