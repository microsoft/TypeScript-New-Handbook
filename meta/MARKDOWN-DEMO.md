__toc__

# Header Levels: 1 through 5

H1 content

## Header 2

H2 content

### Header 3

H3 content

#### Header 4

H4 content

##### Header 5

H5 content

# Lists

## Unordered

 * California
 * Washington
   * Seattle
     * Belltown
     * Greenlake
 * Oregon
 * New York
   * New York
     * Manhattan

## Ordered

 1. One
 2. Two
 3. Three
 4. Four


# Code Samples

## Highlighting
```ts
function greet(person: { name: string, age: number }) {
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    return "Hello " + person.age;
}
```

## TypeScript with Errors
```ts
// This is a TypeScript code block
// It renders as code
function fn(s: string) {
    const y = `Neat ${s.toLowerCase()}`;
    return y;
}
const m = fn("hello, world");

class MyClass {
    m = 10;
    constructor(public alfalfa = "100") {
        this.alfalfa = 10;
    }
}
```

## QuickInfo

```ts
class MyClass {
    constructor(public alfalfa = "100") {
        this.alfalfa = "";
                ^?
    }
}
```

# Blockquotes

## Single

Content above the quote

> This is a quote that
> has multiple lines

Content below the quote

## Double

Content above the quote

>> Double-bracket

Content below the quote

# Links

Link to [[Blockquotes]]

# Formatting

*Single* asterisks, **double** asterisks
