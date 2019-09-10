# Types from Transformation

There are certain patterns that are very commonplace in JavaScript, like iterating over the keys of objects to create new ones, and returning different values based on the inputs given to us.
This idea of creating new values and types on the fly is somewhat untraditional in typed languages, but TypeScript provides some useful base constructs in the type system to accurately model that behavior, much in the same way that `keyof` can be used to discuss the property names of objects, and indexed access types can be used to fetch values of a certain property name.

We'll quickly see that combined, these smaller constructs can be surprisingly powerful and can express many patterns in the JavaScript ecosystem.

## Conditional Types

At the heart of most useful programs, we have to make decisions based on input.
JavaScript programs are no different, but given the fact that values can be easily introspected, those decisions are also based on the types of the inputs.
*Conditional types* help describe the relation between the types of inputs and outputs.

```ts
interface Animal {
    live(): void;
}
interface Dog extends Animal {
    woof(): void;
}

type Foo = Dog extends Animal ? number : string;
     ^?

type Bar = RegExp extends Animal ? number : string;
     ^?
```

Conditional types take a form that looks a little like conditional expresions (`cond ? trueExpression : falseExpression`) in JavaScript:

```ts
type SomeType = any;
type OtherType = any;
type TrueType = any;
type FalseType = any;
type Stuff =
//cut
SomeType extends OtherType ? TrueType : FalseType
```

When the type on the left of the `extends` is assignable to the one on the right, then you'll get the type in the first branch (the "true" branch); otherwise you'll get the type in the latter branch (the "false" branch).

From the examples above, conditional types might not immediately seem useful - we can tell ourselves whether or not `Dog extends Animal` and pick `number` or `string`!
But the power of conditional types comes from using them with generics.

For example, let's take the following `createLabel` function:

```ts
interface IdLabel { id: number, /* some fields */ }
interface NameLabel { name: string, /* other fields */ }

function createLabel(id: number): IdLabel;
function createLabel(name: string): NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel {
    throw "unimplemented";
}
```

These overloads for createLabel describe a single JavaScript function that makes a choice based on the types of its inputs. Note a few things:

1. If a library has to make the same sort of choice over and over throughout its API, this becomes cumbersome.
2. We have to create three overloads: one for each case when we're *sure* of the type (one for `string` and one for `number`), and one for the most general case (taking a `string | number`). For every new type `createLabel` can handle, the number of overloads grows exponentially.

Instead, we can encode that logic in a conditional type:

```ts
interface IdLabel { id: number, /* some fields */ }
interface NameLabel { name: string, /* other fields */ }
//cut
type NameOrId<T extends number | string> =
    T extends number ? IdLabel : NameLabel;
```

We can then use that conditional type to simplify out overloads down to a single function with no overloads.

```ts
interface IdLabel { id: number, /* some fields */ }
interface NameLabel { name: string, /* other fields */ }
type NameOrId<T extends number | string> =
    T extends number ? IdLabel : NameLabel;
//cut
function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
    throw "unimplemented"
}

let a = createLabel("typescript");
    ^?

let b = createLabel(2.8);
    ^?

let c = createLabel(Math.random() ? "hello" : 42);
    ^?
```

### Conditional Type Constraints

Often, the checks in a conditional type will provide us with some new information.
Just like with narrowing with type guards can give us a more specific type, the true branch of a conditional type will further constraint generics by the type we check against.

For example, let's take the following:

```ts
type MessageOf<T> = T["message"];
```

In this example, TypeScript errors because `T` isn't known to have a property called `message`.
We could constrain `T`, and TypeScript would no longer complain:

```ts
type MessageOf<T extends { message: unknown }> = T["message"];

interface Email {
    message: string;
}

interface Dog {
    bark(): void;
}

type EmailMessageContents = MessageOf<Email>;
     ^?
```

However, what if we wanted `MessageOf` to take any type, and default to something like `never` if a `message` property isn't available?
We can do this by moving the constraint out and introducing a conditional type:

```ts
type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;

interface Email { message: string }

interface Dog { bark(): void }

type EmailMessageContents = MessageOf<Email>;
     ^?

type DogMessageContents = MessageOf<Dog>;
     ^?
```

Within the true branch, TypeScript knows that `T` *will* have a `message` property.

As another example, we could also write a type called `Flatten` that flattens array types to their element types, but leaves them alone otherwise:

```ts
type Flatten<T> = T extends any[] ? T[number] : T

// Extracts out the element type.
type Str = Flatten<string[]>;
     ^?

// Leaves the type alone.
type Num = Flatten<number>;
     ^?
```

When `Flatten` is given an array type, it uses an indexed access with `number` to fetch out `string[]`'s element type.
Otherwise, it just returns the type it was given.

### Inferring Within Conditional Types

We just found ourselves using conditional types to apply constraints and then extract out types.
This ends up being such a common operation that conditional types make it easier.

Conditional types provide us with a way to infer from types we compare against in the true branch using the `infer` keyword.
For example, we could have inferred the element type in `Flatten` instead of fetching it out "manually" with an indexed access type:

```ts
type Flatten<T> = T extends Array<infer U> ? U : T;
```

Here, using the `infer` keyword declaratively introduced a new generic type variable named `U` instead of specifying how to retrieve the element type of `T`.
This frees us from having to think about how to dig through and probe apart the structure of the types we're interested.

We can write some useful helper type aliases using the `infer` keyword.
For example, for simple cases, we can extract the return type out from function types:

```ts
type GetReturnType<T> =
    T extends (...args: never[]) => infer U ? U : never;

type Foo = GetReturnType<() => number>;
     ^?

type Bar = GetReturnType<(x: string) => string>;
     ^?

type Baz = GetReturnType<(a: boolean, b: boolean) => boolean[]>;
     ^?
```

## Distributive Conditional Types

When conditional types act on a generic type, they become *distributive* when given a union type.
For example, take the following:

```ts
type Foo<T> = T extends any ? T[] : never;
```

If we plug a union type into `Foo`, then the conditional type will be applied to each member of that union.

```ts
type Foo<T> = T extends any ? T[] : never;

type Bar = Foo<string | number>;
     ^?
```

What happens here is that `Foo` distributes on

```ts
type Blah =
//cut
string | number
```

and maps over each member type of the union, to what is effectively

```ts
type Foo<T> = T extends any ? T[] : never;
type Blah =
//cut
Foo<string> | Foo<number>
```

which leaves us with

```ts
type Blah =
//cut
string[] | number[]
```

Typically, distributivity is the desired behavior.
To avoid that behavior, you can surround each side of the `extends` keyword with square brackets.

```ts
type Foo<T> = [T] extends [any] ? T[] : never;

// 'Bar' is no longer a union.
type Bar = Foo<string | number>;
     ^?
```