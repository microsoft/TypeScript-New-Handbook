# TypeScript for the Java/C# Programmer

TypeScript is a popular choice for programmers accustomed to other languages with static typing, such as C# and Java.
Its type system offers many of the same benefits, such as better code completion, earlier detection of errors, and clearer communication between parts of your program.
While TypeScript provides many familiar features for these developers, it's worth stepping back to see how JavaScript (and therefore TypeScript) differ from traditional OOP languages.
Understanding these differences will help you write better JavaScript code, and avoid common pitfalls that programmers who go straight from C#/Java to TypeScript may fall in to.

    * Rethinking the OOP mold: Classes, namespaces
    * Rethinking the OOP mold: Structural Types
    * Inference 101
    * Co-learning JavaScript

## Rethinking the Class

C# and Java are what we might call *mandatory OOP* languages.
In these languages, the *class* is the basic unit of code organization, and also the basic container of all data *and* behavior at runtime.
Forcing all functionality and data to be held in classes can be a good domain model for some problems, but not every domain *needs* to be represented this way.

### Free Functions and Data

In JavaScript, functions can live anywhere, and data can be passed around freely without being inside a pre-defined `class` or `struct`.
This flexibility is extremely powerful.
"Free" functions (those not associated with a class) working over data without an implied OOP hierarchy tends to be the preferred model for writing programs in JavaScript.

Additionally, certain constructs from C# and Java such as singletons and static classes are unnecessary in TypeScript.
Those constructs *only* exist because those languages force all data and functions to be inside a class; because that restriction doesn't exist in TypeScript, there's no need for them.
A class with only a single instance is typically just represented as a normal *object* in JavaScript/TypeScript, and a static class is actually just a *namespace* in TypeScript.

### 

That said, you can still use classes if you like!
Some problems are well-suited to being solved by a traditional OOP hierarchy, and TypeScript's support for JavaScript classes will make these models even more powerful.
We'll cover classes later in this guide.





## Rethinking the OOP Mold - Classes; Namespaces

      * OOP isn't mandatory in JS - no static classes, etc
      * Therefore, classes will come late in this guide
      * But we still got your back
      * Preferred patterns - unions, etc vs inheritance
      * JSON/POJOs as a data container vs classes

## Rethinking the OOP Mold - Structural Types

      * Types are a domain of values, not a class or built-in primitive
      * Structural types are structural, yes, structural, see, structural
      * Classes are structural
      * Classes *are structural*

## Inference 101

## Co-learning JavaScript

