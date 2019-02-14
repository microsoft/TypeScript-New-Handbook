# Widening and Narrowing in Typescript

This document covers the following concepts:

1. Widening: treat an internal type as a normal one.
2. Literal widening: treat a literal type as a primitive one.
3. Narrowing: remove constituents from a union type.
4. Instanceof narrowing: treat a type as a subclass.
5. Apparent type: treat a non-object type as an object type.

## Widening

Widening is the simplest operation. The types `null` and `undefined`
are converted to `any`. This happens recursively in object types,
union types, and array types (including tuples), but only when
`--strictNullChecks` is off. With `--strictNullChecks` on, widening no
longer happens.


Before `--strictNullChecks` existed, the compiler already had
internal-only types for `null` and `undefined`. But these types
needed to be converted to `any` whenever they became external, such as
when they were displayed in an editor. That's still what happens
when `--strictNullChecks` is off. For example:

```ts
// @strict: false
let x = null;
```

Here, `null` has the type `null`, even with `--strictNullChecks` off,
but `x` has the type `any`. The compiler widens on assignment.
`undefined` works the same way.

## Literal widening

Literal widening is significantly more complex than "classic"
widening. Basically, when literal widening happens, a literal type
like `"foo"` or `SomeEnum.Member` gets treated as its base type:
`string` or `SomeEnum`, respectively. The places where literals widen,
however, cause the behaviour to be hard to understand. Literal
widening is described fully
[at the literal widening PR](https://github.com/Microsoft/TypeScript/pull/10676)
and
[its followup](https://github.com/Microsoft/TypeScript/pull/11126).

### When does literal widening happen?

There are two key points to understand about literal widening.

1. Literal widening only happens to literal types that originate from
expressions. These are called *fresh* literal types.
2. Literal widening happens whenever a fresh literal type reaches a
*mutable* location.

One example of a mutable location is a `let` variable declaration. In
contrast, a `const` variable declaration is not a mutable location.
Compare the following two statements:

```ts
const one = 1; // 'one' has type: 1
let num = 1;   // 'num' has type: number
```

For the first statement:

1. `1` is an expression, so it has the fresh literal type `1`.
2. `1: 1` is assigned to `const one`, which is not mutable, so `one: 1`.
   But the type `1` is still fresh, which will be important later.

Meanwhile, for the second statement:

1. `1` is an expression, so it has the fresh literal type `1`.
2. `1: 1` is assigned to `let num`, a mutable location, so `num: number`.

Mutable locations and fresh literal types interact in confusing ways.
For example:

```ts
const one = 1;
let n = one; // 'n' has type: number
```

The first two steps are the same as the first example. The third step

1. `1` is an expression, so it has the fresh literal type `1`.
2. `1: 1` is assigned to `const one`, so `one: 1`.
3. `one: 1` is assigned to `n`, a mutable location, so `n: number`.

The fresh literal type `1` makes its way
*through* the assignment to `one` down to the assignment to `wat`,
and since it's still fresh widens to `number`. But this is the way a
real program is supposed to work. The program defines constants at the
top, then uses those constants as the initial values for variables:

```ts
const start = 1001;
const max = 100000;
// many (thousands?) of lines later ...
for (let i = start; i < max; i = i + 1) {
  // did I just write a for loop?
  // is this a C program?
}
```

The type of `i` must be number; if it were `1001` then it could only
over have the value `1001` and the statement `i = i + 1` would be illegal.

Other mutable locations are members of array literals and object literals.
TODO: As CONST

```ts
const nums = [1, 2, 3]; // 'nums' has type: number[]
nums[0] = 101; // because Javascript arrays are always mutable

const doom = { e: 1, m: 1 }
doom.e = 2 // Mutable objects! We're doomed!

// Dooomed!
// Doomed!
// -gasp- Dooooooooooooooooooooooooooooooooo-
```

### What literal types widen?

* Number literal types like `1` widen to `number`.
* String literal types like `'hi'` widen to `string`.
* Boolean literal types like `true` widen to `boolean`.
* Enum members widen to their containing enum.

An example of the last is:

```ts
enum State {
  Start,
  Expression,
  Term,
  End
}
const start = State.Start;
let state = start;
let ch = '';
while (ch = nextChar()) {
  switch (state) {
    // ... imagine your favourite tokeniser here
  }
}
```

## Narrowing

Narrowing is essentially the removal of types from a union. It's
happening all the time as you write code, especially if you use
`--strictNullChecks`. To understand narrowing, you first need to
understand the difference between "declared type" and "computed type".

The declared type of a variable is the one it's declared with. For
`let x: number | undefined`, that's `number | undefined`. The computed
type of a variable is the type of the variable as it's used in
context. Here's an example:

```ts
// @strict: true
type Thing = { name: 'one' | 'two' };
function process(origin: Thing, extra?: Thing | undefined): void {
  preprocess(origin, extra);
  if (extra) {
    console.log(extra.name);
    if (extra.name === 'one') {
      // ...
```

`extra`'s declared type is `Thing | undefined`, since it's an optional
parameter. However, its computed type varies based on context. On the
first line, in `preprocess(origin, extra)`, its computed type is still
`Thing | undefined`. However, inside the `if (extra)` block, `extra`'s
computed type is now just `Thing` because it can't possibly be
`undefined` due to the `if (extra)` check. Narrowing has removed
`undefined` from its type.

Similarly, the declared type of `extra.name` is `'one' | 'two'`, but
inside the true branch of `if (extra.name === 'one')`, its computed
type is just `'one'`.

Narrowing mostly commonly removes all but one type from a union, but
doesn't necessarily need to:

```ts
type Type = Anonymous | Class | Interface
function f(thing: string | number | boolean | object) {
  if (typeof thing === 'string' || typeof thing === 'number') {
    return lookup[thing];
  }
  else if (typeof thing === 'boolean' && thing) {
    return globalCachedThing;
  }
  else {
    return thing;
  }
}
```

Here, in the first if-block, `thing` narrows to `string | number` because
the check allows it to be either string or number.

## Instanceof Narrowing

Instanceof narrowing looks similar to normal narrowing, and
behaves similarly, but its rules are somewhat different. It only
applies to certain `instanceof` checks and type predicates.

Here's a use of `instanceof` that follows the normal narrowing rules:

```ts
class C { c: any }
function f(x: C | string) {
  if (x instanceof C) {
    // x is C here
  }
  else {
    // x is string here
  }
}
```

So far this follows the normal narrowing rules. But `instanceof`
applies to subclasses too:

```ts
class D extends C { d: any }
function f(x: C) {
  if (x instanceof D) {
    // x is D here
  }
  else {
    // x is still just C here
  }
}
```

Unlike narrowing, `instanceof` narrowing doesn't remove any types to
get `x`'s computed type. It just notices that `D` is a subclass of `C`
and changes the computed type to `D` inside the `if (x instanceof D)`
block. In the `else` block `x` is still `C`.

If you mess up the class relationship, the compiler does its best
to make sense of things:

```ts
class E { e: any } // doesn't extend C!
function f(x: C) {
  if (x instanceof E) {
    // x is C & E here
  }
  else {
    // x is still just C here
  }
}
```

The compiler thinks that something of type `C` can't also be
`instanceof E`, but just in case, it sets the computed type of `x` to
`C & E`, so that you can use the properties of `E` in the block
&mdash; just be aware that the block will probably never execute!

### Type predicates

Type predicates follow the same rules as `instanceof` when narrowing,
and are just as subject to misuse. So this example is equivalent to
the previous wonky one:

```ts
function isE(e: any): e is E {
  return e.e;
}
function f(x: C) {
  if (isE(x)) {
    // x is C & E here
  }
  else {
    // nope, still just C
  }
}
```

## Apparent Type

In some situations you need to get the properties on a variable, even
when it technically doesn't have properties. One example is primitives:

```ts
let n = 12
let s = n.toFixed()
```

`12` doesn't technically have properties; `Number` does. In order to
map `number` to `Number`, we define `Number` as the *apparent type* of
`number`. Whenever the compiler needs to get properties of some type,
it asks for the apparent type of that type first. This applies to
other non-object types like type parameters:

```ts
interface Node {
  parent: Node;
  pos: number;
  kind: number;
}
function setParent<T extends Node>(node: T, parent: Node): T {
  node.parent = parent;
  return node;
}
```

`T` is a type parameter, which is just a placeholder. But its
constraint is `Node`, so when the compiler checks `node.parent`, it
gets the apparent type of `T`, which is `Node`. Then it sees that
`Node` has a `parent` property.
