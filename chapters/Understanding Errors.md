
# Understanding Errors

Whenever TypeScript finds an error, it tries to explain what went wrong in as much detail as possible.
Because its type system is structural, this often means providing somewhat lengthy descriptions of where it found a problem.

## Glossary

There is some terminology you'll frequently see in error messages that is helpful to understand.

#### *assignable to*

TypeScript considers a type *assignable to* another type if one is an acceptable substitute for the other.
In other words, a `Cat` is *assignable to* an `Animal` because a `Cat` is an acceptable substitute for an `Animal`.

As its name implies, this relationship is used to check the validity of an assignment `t = s;` by examining the types of `t` and `s`.
It's also used to check most other places where two types interact.
For example, when calling a function, each argument's type must be *assignable to* parameter's declared type.

Informally, if you see `T is not assignable to S`, you can think of that as TypeScript saying "*`T` and `S` are not compatible"*.
However, note that this is a *directional* relationship: `S` being assignable to `T` does not imply that `T` is assignable to `S`.

## Examples

Each error starts with a leading message, sometimes followed by more sub-messages.
You can think of each sub-message as answering a "why?" question about the message above it.
Let's work through some examples to see how they work in practice.

### Example 1

Here's an example that produces an error message longer than the example itself:

```ts
let a: { m: number[] };
let b = { m: [""] };
a = b;
```

TypeScript found an error when checking the last line.
Its logic for issuing an error follows from its logic for determining if the assignment is OK:

1. Is `b`'s type assignable to `a`'s? No. Why?
2. Because the type of the `m` property is incompatible. Why?
3. Because `b`'s `m` property (`string[]`) is not assignable to `a`'s `m` property (`number[]`). Why?
4. Because one array's element type (`string`) is not assignable to the other (`number`)
