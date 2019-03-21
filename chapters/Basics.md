# Types in JavaScript: they *do* exist!

__toc__

Each and every value in JavaScript has a set of behaviors you can observe from running different operations.
That sounds abstract, but as a quick example, consider some operations we might run on a variable named `foo`.

```js
// accessing the property 'toLowerCase'
// on 'foo' and then calling it
foo.toLowerCase();

// calling 'foo'
foo();
```

If we break this down, the first runnable line of code accesses a property called `toLowerCase` and then calls it.
The second one tries to call `foo` directly.

But assuming we don't know the value of `foo` - and that's pretty common - we can't reliably say what results we'll get from trying to run any of this code.
The behavior of each operation depends entirely on what what value we had in the first place.
Is `foo` callable?
Does it have a property called `toLowerCase` on it?
And if it does, is `toLowerCase` callable?
If all of these values are callable, what do they return?
The answers to these questions are usually things we keep in our heads when we write JavaScript, and we have to hope we got all the details right.

Let's say `foo` was defined in the following way.

```js
let foo = "Hello World!";
```

As you can probably guess, if we try to run `foo.toLowerCase()`, we'll get the same string, but completely in lower-case letters.

```
"hello world!"
```

What about that second line of code?
If you're familiar with JavaScript, you'll know this fails with a thrown error.

```
TypeError: foo is not a function
```

Oof - it'd be great if we could avoid mistakes like this.
When we run our code, the way that our JavaScript runtime chooses what to do is by figuring out the *type* of the value - what sorts of behaviors and capabilities it has.
That's part of what that `TypeError` is alluding to - it's saying that there's nothing to call on the string `"Hello World"`

You might have heard of types before and assumed it was a TypeScript-specific concept.
That's totally understandable - I mean, it's got "type" right there in the name!
But the truth is that types are firmly baked into JavaScript itself.
That `TypeError` hinted to it before, but we can also see this for ourselves using the `typeof` operator.

```js
typeof 1234; // has type "number"

typeof "hello world" // has type "string"
```

These are what we call "runtime types" or "dynamic types".
When we run our code, the value `1234` has a type called `number`, and the value `"hello world"` has the type `string`.
When we say that JavaScript is a "dynamically typed" language, we mean the types are there, but we aren't concerned with them until our code actually runs.

# Static type-checking

Think back to that `TypeError` we got earlier from calling a `string`.
*Most people* don't like to get any sorts of errors when running their code - those are considered bugs!
And when we write new code, we try our best to avoid introducing new bugs.

If we add just a bit of code, save our file, refresh our app, and immediately see the error, we might be able to isolate the problem quickly; but that's not always the case.
We might not have tested the feature thoroughly enough, so we might never actually run into a potential error that would be thrown!
Or if we were lucky enough to witness the error, we might have ended up doing large refactorings and adding a lot of different code that we're forced to dig through.

Ideally, we could have a tool that helps us find these bugs *before* our code runs.
That's what a static type-checker like TypeScript does.
*Static types systems* describe the shapes and behaviors of what our values will be when we run our programs.
A type-checker like TypeScript uses that information and tells us when things might be going off the rails.

```ts
let foo = "hello!";

foo();
```

Running that last sample with TypeScript will give us an error message before we run the code in the first place.

# Bugs beyond runtime errors

So far we've been discussing certain things like runtime errors - cases where the JavaScript runtime throws its hands up and tells us that it thinks something is nonsensical.
Those cases come up because [the ECMAScript specification](https://tc39.github.io/ecma262/) actually declares that trying to call something that isn't callable causes an error.
Sounds obvious, but you could imagine that accessing a property on an object that doesn't exist would cause an error too.
Instead, JavaScript gives us different behavior to keep things entertaining and gives us the value `undefined`.

```js
let foo = {
    name: "Daniel",
    age: 26,
};

foo.location; // returns undefined
```

Ultimately, a static type system has to make the call over what code should be flagged as an error in its system, even if it's valid JavaScript that won't immediately throw an error.
So in TypeScript, the following code produces an error about `location` not being defined.

```ts
let foo = {
    name: "Daniel",
    age: 26,
};

foo.location; // returns undefined
```

While sometimes that implies a tradeoff in what you can express, the intent is to catch legitimate bugs in our programs.
And TypeScript catches *a lot* of legitimate bugs.
For example: typos,

```ts
let someString = "Hello World!";

// How quickly can you spot the typos?
someString.toLocaleLowercase();
someString.toLocalLowerCase();

// We probably meant to write this...
someString.toLocaleLowerCase();
```

uncalled functions,

```ts
function flipCoin() {
    return Math.random < 0.5;
}
```

or basic logic errors.

<!-- TODO: this example screws with our tooltips -->

```ts
const value =
    Math.random() < 0.5 ? "a" :
        Math.random() < 0.5 ? "b" :
            "c";

// Oops - neither 'else if' branch will ever run!
if (value !== "a") {
  // ...
}
else if (value === "b") {
  // ...
}
else if (value === "c") {
  // ...
}
```

# TypeScript tooling

<!-- TODO: this section's title sucks -->

So TypeScript can catch bugs when we make mistakes in our code.
That's great, but TypeScript can *also* prevent us from making those mistakes in the first place.

You see, the type-checker has information to check things like whether we're accessing the right properties on variables and other properties.
But once it has that information, it can also start *suggesting* which properties you might want to use.

That means TypeScript can be leveraged for editing code too, and so the core type-checker can provide error messages and code completion as you type across editors.
That's part of what people often refer to when they talk about tooling in TypeScript.

<!-- TODO: insert GIF of completions here -->

TypeScript takes tooling seriously, and that goes beyond completions and errors as you type.
An editor that supports TypeScript can deliver "quick fixes" to automatically fix errors, refactorings to easily re-organize code, and useful navigation features for jumping to definitions of a variable, or finding all references to a given variable.
All of this is built on top of the type-checker and fully cross-platform, so it's likely that [your favorite editor has TypeScript support available](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support).

<!-- TODO: validate that link -->

# `tsc`, the TypeScript compiler

Alright, alright, let's cut to the chase.
We've been talking about type-checking, but we haven't yet our type-*checker*.
Let's get acquainted with our new friend `tsc`, the TypeScript compiler.
First we'll need to grab it via npm.

```sh
npm install -g typescript
```

> **Side note:** Firstly, if you're on a Unix system like Mac or Linux, you might need a `sudo` at the fron there. But secondly, if you're already pretty experienced with JavaScript and the npm ecosystem, you might be taken aback a bit here.
> You're probably not the only one if you just had a reaction like  "**\*gasp\*** a global npm install!?" or "**\*groan\*** how am I going to fit this into my build system with Webpack/gulp/etc.?"
> The good news is, no, you don't have to install TypeScript globally.
> And don't worry, there are many different integrations for TypeScript with existing build tools.
> If you already know better, then by all means do so with tools like npx, yarn, ts-loader, and gulp-typescript.
> But this is by far the easiest way to use TypeScript today.

Now let's move to an empty folder and try writing our first TypeScript program: `hello.ts`:

```ts
// Greets the world.
console.log("Hello world!");
```

Notice there are no frills here; this "hello world" program looks identical to what you'd write for a "hello world" program in JavaScript.
And now let's type-check it by running the command `tsc` which was installed for us by the `typescript` package.

```sh
tsc hello.ts
```

Tada!
Wait, tada *what* exactly?
We ran `tsc` and nothing happened!
Well, there were no type errors, so we didn't get any *console* output.

But check again - we got some *file* output instead.
If we look in our current directory, we'll see a `hello.js` file next to `hello.ts`.
That's the output from our `hello.ts` file after `tsc` *compiles* or *transforms* it into a JavaScript file.
And if we check the contents, we'll what TypeScript spits out after it processes a `.ts` file:

```js
// Greets the world.
console.log("Hello world!");
```

In this case, there was very little for TypeScript to transform, so it looks identical to what we wrote!
The compiler tries to emit clean readable code that looks like something a person would write.
While that's not always so easy, TypeScript indents consistently, is mindful of when our code spans across different lines of code, and tries to keep comments around.

What about if we *did* introduce a type-checking error?
Let's rewrite `hello.ts`:

```ts
// This is an industrial-grade general-purpose greeter function:
function greet(person, date) {
    console.log(`Hello ${person}, today is ${date}!`);
}

greet("Brendan");
```

If we run `tsc hello.ts` again, notice that we get an error on the command line!

```
Expected 2 arguments, but got 1.
```

TypeScript is telling us we forgot to pass an argument to the `greet` function, and rightfully so.
So far we've only written standard JavaScript, and yet type-checking was still able to find problems with our code.
Thanks TypeScript!

## Errors don't block output

One thing you might not have noticed from the last example was that our `hello.js` file changed again.
If we open that file up then we'll see that the contents still basically look the same as our input file.
That might be a bit surprising given the fact that `tsc` reported an error about our code, but this based on one of TypeScript's core values: much of the time, *you* will know better than TypeScript.

To reiterate from earlier, type-checking code limits the sorts of programs you can run, and so there's a tradeoff on what sorts of things a type-checker finds acceptable.
Most of the time that's okay, but there are scenarios where those checks get in the way.
For example, imagine yourself migrating JavaScript code over to TypeScript and introducing type-checking errors.
Eventually you'll get around to cleaning things up for the type-checker, but that original JavaScript code was already working!
Why should converting it over to TypeScript stop you from running it?

So TypeScript doesn't get in your way.
Of course, over time, you may want to be a bit more defensive against mistakes, and make TypeScript act a bit more strictly.
In that case, you can use the `--noEmitOnError` compiler option.
Try changing your `hello.ts` file and running `tsc` with that flag:

```sh
tsc --noEmitOnError hello.ts
```

You'll notice that `hello.js` never gets updated.

## Explicit types

Up until now, we haven't told TypeScript what `person` or `date` are.
Let's change up our code a little bit so that we tell TypeScript that `person` is a `string`, and that `date` should be a `Date` object.
We'll also use the `toDateString()` method on `date`.

```ts
function greet(person: string, date: Date) {
    console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
```

What we did was add *type annotations* on `person` and `date` to describe what types of values `greet` can be called with.
You can read that signature as "`greet` takes a `person` of type `string`, and a `date` of type `Date`".
<!-- TODO: is that really necessary? -->
With this, TypeScript can tell us about other cases where we might have been called incorrectly.
For example...

```ts
function greet(person: string, date: Date) {
    console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", Date());
```

Huh?
TypeScript reported an error on our second argument:

```
Argument of type 'string' is not assignable to type 'Date'.
```

Perhaps surprisingly, calling `Date()` in JavaScript returns a `string`.
On the other hand, constructing a `Date` with `new Date()` actually gives us what we were expecting.

> **Side note**: Thanks JavaScript. We still ❤ you though.

Anyway, we can quickly fix up the error:

```ts
function greet(person: string, date: Date) {
    console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", new Date());
```

# Optional types and type inference

<!-- TODO talk about this and 'any' -->

## Stripping types out

Let's take a look at what happens when we compile with `tsc`:

```js
function greet(person, date) {
    console.log("Hello " + person + ", today is " + date.toDateString() + "!");
}
greet("Maddison", new Date());
```

Notice two things here:

1. Our `person` and `date` parameters no longer have type annotations.
2. Our "template string" - that string that used backticks (the `` ` `` character - was converted to plain strings with concatenations (`+`).

More on that second point later, but let's now focus on that first point.
Type annotations aren't part of JavaScript (or ECMAScript to be pedantic), so there really aren't any browsers or other runtimes that can just run TypeScript unmodified.
That's why TypeScript needs a compiler in the first place - it needs some way to strip out or transform any TypeScript-specific code so that you can run it.
Most TypeScript-specific code gets erased away, and likewise, here our type annotations were completely erased.

## Downleveling

One other difference from the above was that our template string was rewritten from

```js
`Hello ${person}, today is ${date.toDateString()}!`
```

to

```js
"Hello " + person + ", today is " + date.toDateString() + "!"
```

Why did this happen?
Well template strings are a feature from a version of ECMAScript called ECMAScript 2015 (a.k.a. ECMAScript 6, ES2015, ES6, etc. - don't ask).
TypeScript has the ability to rewrite code from newer versions of ECMAScript to older ones such as ECMAScript 3 or ECMAScript 5 (a.k.a. ES3 and ES5).
This process from moving from a newer or "higher" version of ECMAScript to an older or "lower" one is sometimes called *downleveling*.

By default TypeScript targets ES3, an extremely old version of ECMAScript.
We could have chosen something a little bit more recent by using the `--target` flag.
Running with `--target es2015` changes TypeScript to target ECMAScript 2015, meaning code should be able to run wherever ECMAScript 2015 is supported.
So running `tsc --target es2015 input.ts` gives us the following output:

```js
function greet(person, date) {
    console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
greet("Maddison", new Date());
```

<!-- TODO: is this side note needed? -->

> **For some historical context**, when TypeScript first came out, part of its vision was to provide the future features of JavaScript when they weren't supported in any runtime.
> Given the fact that TypeScript needed a tool to strip types away, it made a lot of sense for the compiler to downlevel code as well.
> While today there are other compilers that provide the same functionality and also strip out types (such as Babel), TypeScript is also incredibly efficient at this task, still produces approachable JavaScript output, and has very accurate source-mapping support so you can debug the code that you wrote.

# Strictness

Users come to TypeScript looking for different things in a type-checker.
Some people are looking for a more loose opt-in experience which can help validate only some parts of our program and give us decent tooling.
This is actually the default experience with TypeScript.
Types are optional, inference takes the most loose options, and there's no checking for potentially `null`/`undefined` values.
Much like how `tsc` emits in the face of errors, these defaults are put in place to get out of your way.
If you're starting out with TypeScript or migrating existing JavaScript, that mght be desirable.

A lot of users prefer to have TypeScript validate as much as it can off the bat, and that's why the language provides strictness settings as well.
These strictness settings turn static type-checking from a switch (either your code is checked or not) into something closer to a dial.
The farther you turn this dial up, the more TypeScript will check for you.
This can require a little extra work, but generally speaking it pays for itself in the long run, and enables more thorough checks and more accurate tooling.

TypeScript has several type-checking strictness flags that can be turned on or off, and all of our examples will be written with all of them enabled unless otherwise stated.
The `--strict` flag toggles them all on simultaneously, but we can opt out of them individually.
The two biggest ones you should know about are `noImplicitAny` and `strictNullChecks`.

## `noImplicitAny`

Recall that in some places, TypeScript doesn't try to infer any types for us and instead falls back to the most lenient type: `any`.
This isn't the worst thing that can happen - after all, falling back to `any` is just the JavaScript experience anyway.

However, using `any` often defeats the purpose of using TypeScript in the first place.
The more typed your program is, the more validation and tooling you'll get, meaning you'll run into fewer bugs as you code.
Turning on the `noImplicitAny` flag will issue an error on any variables whose type is implicitly inferred as `any`.

## `strictNullChecks`

By default, values like `null` and `undefined` are assignable to any other type.
This can make writing some code easier, but forgetting to handle `null` and `undefined` is the cause of countless bugs in the world - not even just JavaScript!

The `strictNullChecks` flag makes handling `null` and `undefined` more explicit, and *spares* us from worrying about whether we *forgot* to handle `null` and `undefined`.
