# TypeScript Basics

## What is a Type?

    * TypeScript *models* runtime behavior
      * e.g. typeof operator exists
      * Some operations make sense, some don't
      * We try to catch nonsense operations early

## What is Static Type Checking?

### Static: Before your code runs

      * Detect ahead of time whether your program makes sense

### Checking: detecting errors & determining outputs

    * "Checking" means "detecting errors"
      * Examples of typo-catches
      * Examples of wrong-value errors
      * Examples of invalid operations
      * Sometimes code you meant to write looks wrong; we'll tell you how to inform TS what you meant to do

## Benefits of Static Type Checking

### Error detection

### Tooling

    * "static" means "before your code runs"

    * Tooling: Your editor will be extremely helpful now
      * Completion, navigation, etc
      * Only suggest things that make sense

## What Happens When I run tsc?

    * Type checking
      * Type errors won't block emit
      * Feel free to run the JS anyway
    * Remove type annotations
      * TS doesn't add runtime checking
      * TS won't cause your program to not work at runtime
    * Downleveling 
      * Briefly explain ES3/5/6/+

## Getting Set Up

    * Install editor of your choice (VS Code or VS Code)
    * checkJs / ts-check
    * tsc --init
    * Basic compiler options: strict, target, lib, module
      * How to decide these settings
