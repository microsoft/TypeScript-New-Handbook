# Outline

## Introductions

### TypeScript for the New Programmer

* Getting Started Part 1: Customized Introductions to TypeScript
  * TypeScript for the New Programmer
    * What is JavaScript?
      * Runs everywhere
      * Untyped, error-prone language
      * Super common
    * What is TypeScript?
      * Adds types to JavaScript
      * Your existing code works
    * What's a type? (For newbies)
      * A type is a *kind* of value
      * Types implicitly define what operations make sense on them
      * Lots of different kinds, not just primitives
      * We can make descriptions for all kinds of values
    * Inference 101
      * Examples
      * TypeScript can figure out types most of the time
      * Two places we'll ask you what the type is: Function boundaries, and later-initialized values
    * Co-learning JavaScript
      * You can+should read existing JS resources
      * Just paste it in and see what happens
      * Consider turning off 'strict'
  * TypeScript for the JavaScript Programmer
    * What is TypeScript?
    * What's a type? (For newbies)
    * checkJs / ts-check
      * Try this out on your existing files, see what happens!
      * You can use JS Doc if you like
    * Inference 101
    * All JS is TS
      * What this means (behavior)
      * What this means (type errors)
      * c.f. https://stackoverflow.com/questions/41750390/what-does-all-legal-javascript-is-legal-typescript-mean
  * TypeScript for the Java/C# Programmer
    * Rethinking the OOP mold: Classes, namespaces
      * OOP isn't mandatory in JS - no static classes, etc
      * Therefore, classes will come late in this guide
      * But we still got your back
      * Preferred patterns - unions, etc vs inheritance
      * JSON/POJOs as a data container vs classes
    * Rethinking the OOP mold: Structural Types
      * Types are a domain of values, not a class or built-in primitive
      * Structural types are structural, yes, structural, see, structural
      * Classes are structural
      * Classes *are structural*
    * Inference 101
    * Co-learning JavaScript
  * TypeScript for the Functional Programmer
    * Welcome Home
    * Inference 301
  * TypeScript for the Veteran Programmer
    * --> right to page 1

 * Chapter 1: Basics
  * The What & Why of Static Type Checking
    * TypeScript *models* runtime behavior
      * e.g. typeof operator exists
      * Some operations make sense, some don't
      * We try to catch nonsense operations early
    * "static" means "before your code runs"
      * Detect ahead of time whether your program makes sense
    * "Checking" means "detecting errors"
      * Examples of typo-catches
      * Examples of wrong-value errors
      * Examples of invalid operations
      * Sometimes code you meant to write looks wrong; we'll tell you how to inform TS what you meant to do
    * Tooling: Your editor will be extremely helpful now
      * Completion, navigation, etc
      * Only suggest things that make sense
  * What happens when I run tsc?
    * Type checking
      * Type errors won't block emit
      * Feel free to run the JS anyway
    * Remove type annotations
      * TS doesn't add runtime checking
      * TS won't cause your program to not work at runtime
    * Downleveling 
      * Briefly explain ES3/5/6/+
  * Getting set up
    * Install editor of your choice (VS Code or VS Code)
    * checkJs / ts-check
    * tsc --init
    * Basic compiler options: strict, target, lib, module
      * How to decide these settings

 * Chapter 2: Everyday Types
  * Built-in Types
    * string, number, boolean, any, and array
    * Show inference and rules
      * Examples of allowed and disallowed operations
    * Type annotations on variable declarations
  * Functions
    * Parameter type annotations
    * Return type annotations and inference
    * Inference in function expressions
  * Object Types
    * Anonymous object types
    * Type aliases and Interfaces
  * Union Types
    * Simple concept: "This or that"
    * Unions of primitives
    * Introduce concept of type narrowing and demonstrate it with typeof
  * Type assertions
    * Sometimes you know more than the checker
    * `e as T` vs `<T>e`
    * Not all assertions are valid
  * Literal Types
    * String literals
    * Numeric literals
    * Boolean's just an alias for `true` | `false`
    * Combine these with unions for e.g. `"GET" | "POST"`
    * Why do I have to sometimes write `"foo" as "foo"`
  * null and undefined
    * --strictNullChecks: turn it on
    * Undefined in optional parameters and properties
    * Demonstrate basic narrowing to check for them
    * Postfix unary `!`
  * Where do types come from?
    * Built-in (lib.d.ts)
    * Inference
    * Your own types
    * Packaged types
    * DefinitelyTyped

 * Chapter 3: TypeScript Understands Code
   * Introduction: Narrowing
   * Examples of built-in narrowing
    * typeof
    * instanceof
    * truthy/falsy
    * equality
   * Discriminated unions
    * Combining literal types with unions yields a powerful pattern
    * Show an example
    * Show narrowing with the discriminant
    * never
   * User-defined type guards

 * Chapter 4: More on Functions
  * Function type expressions
  * Call/construct signatures
  * Generics
    * "Passing a value through"
      * Stress that a type parameter should always appear in 2 places
    * Generic constraints
    * Using `T` in the body
  * Overloads
    * How to write them
    * The implementation signature is not visible
    * When not to write them
      * Union types
      * Generics
      * Optional parameters
      * etc
  * Rest and destructuring parameters
    * Where do type annotations go?
  * Other types to know about
    * void, object, unknown, never

 * Chapter 5: More on Object Types
  * Optional properties
  * interfaces and type aliases
    * Differences; pros/cons
  * Generic object types
    * Arrays - you've been using them all along
    * ReadonlyArray
    * Always manifest the type parameter
  * readonly modifier
  * Tuples
  * Index signatures
    * numeric
    * string

 * Chapter 6: Types from Extraction
   * typeof (in type positions)
   * keyof
     * Talk about what it does with index signatures
   * Indexed access types
   * `import`

 * Chapter 7: Types from Transformation
  * Introduction
  * Conditional types
  * Mapped types
    * Built-in mapped types ReadOnly, Exclude, etc
  * Intersection types
    * Talk about nominal/tagging

 * Chapter 8: Classes
  * Basics
    * Hey it's just ES6
    * Methods and properties
  * Class heritage
    * inherits
      * ES6 thing again
      * We don't have inherited typing yet
    * implements
      * Again, just a check
      * Be wary of anys
  * public, private, protected
  * Generics
  * Static
  * Managing `this`
    * Arrow functions
    * `this` parameters
    * The `this` type
    * `this`-related flags

 * Chapter 9: Modules
  * Overview of Choices
    * ES6 (read MDN)
    * CommonJS
    * AMD
    * SystemJS
    * UMD
    * See the appendix because oh my god
  * Import forms
  * Synthetic defaults

 * WHERE TO PUT THIS
   * Why do I have to sometimes write `"foo" as "foo"`
   * BigInt


 * Chapter 10: Enums
  * Numeric Enums
    * Oh god there are so many kinds
  * String enums
    * Compare and contrast with literal unions
    * Consider not using them

 * Chapter 11: Namespaces
  * Basics
    * Actually two kinds (instantiated vs not)
  * Merging

 * Appendix: Symbols / unique symbols
 * Appendix: JS Doc in lieu of .ts
 * Appendix: Decorators
 * Appendix: Project references
 * Appendix: Writing Definition Files
  * Basics
  * Declaration Merging
  * UMD Globals
 * Appendix: JSX with React
 * Appendix: Module interop
   * WTF is even going on
   * allowSyntheticDefaultImports
   * esModuleInterop
