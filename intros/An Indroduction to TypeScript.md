# An Introduction to TypeScript

Over 20 years after its introduction to the programming community, JavaScript is now one of the most widespread cross-platform languages ever created.
Starting as a small scripting language for adding trivial interactivity to webpages, JavaScript has grown to be a language of choice for both frontend and backend applications of every size.
While the size, scope, and complexity of programs written in JavaScript has grown exponentially, the ability of the JavaScript language to express the relationships between different units of code has not.
Combined with JavaScript's rather peculiar runtime semantics, this mismatch between language and program complexity has made JavaScript development a difficult task to manage at scale.

The most common kinds of errors that programmers write can be described as *type* errors: a certain kind of value was used where a different kind of value was expected.
This could be due to simple typos, a failure to understand the API surface of a library, incorrect assumptions about runtime behavior, or other errors.
The goal of TypeScript is to be a *static typechecker* for JavaScript programs - in other words, a tool that runs before your code runs (static) and ensure that the types of the program are correct (typechecked).

__toc__

## The TypeScript Handbook

The TypeScript Handbook is intended to be a comprehensive document that explains TypeScript to everyday programmers.

The main chapters of the Handbook are organized so that you can read it *in order*.
In other words, each chapter will only use concepts you've already been introduced to (or should recognize from normal JavaScript).

### Goals

You should expect each chapter or page to provide you with a strong understanding of the given concepts. The TypeScript Handbook is not a complete language specification, but it is intended to be a comprehensive guide to all of the language's features and behaviors.

A reader who completes the walkthrough should be able to:
 * Read and understand commonly-used TypeScript syntax and patterns
 * Explain the effects of important compiler options
 * Correctly predict type system behavior in most cases
 * Write a `.d.ts` declaration for a simple function, object, or class

In the interests of clarity and brevity, the main content of the Handbook will not explore every edge case or minutae of the features being covered.
You can find more details on particular concepts in the reference articles.

### Non-Goals

The Handbook is also intended to be a *concise* document that can be comfortably read in a few hours.
Certain topics won't be covered in order to keep things short.

Specifically, the Handbook does not fully introduce core JavaScript basics like functions, classes, and closures.
Where appropriate, we'll include links to background reading that you can use to read up on those concepts.

The Handbook also isn't intended to be a replacement for a language specification.
In some cases, edge cases or formal descriptions of behavior will be skipped in favor of high-level, easier-to-understand explanations.
Instead, there are separate *reference pages* that more precisely and formally describe many aspects of TypeScript's behavior.
The reference pages are not intended for readers unfamiliar with TypeScript, so they may use advanced terminology or reference topics you haven't read about yet.

Finally, the Handbook won't cover how TypeScript interacts with other tools, except where necessary.
Topics like how to configure TypeScript with webpack, rollup, parcel, react, babel, closure, lerna, rush, bazel, preact, vue, angular, svelte, jquery, rush, yarn, or npm are out of scope - you can find these resources elsewhere on the web.

## Get Started

Before getting started with Chapter 1, we recommend reading one of the following introductory pages.
These introductions are intended to highlight key similarities and differences between TypeScript and your favored programming language, and clear up common misconceptions specific to those languages.
Each introduction ends with a link to Chapter 1.

 * [[TypeScript for the New Programmer]]
 * [[TypeScript for the Java or C# Programmer]]
 * [[TypeScript for the Haskell or ML Programmer]]
 * JavaScript programmers or seasoned multi-paradigm veterans: jump straight to [[Basics]]
 