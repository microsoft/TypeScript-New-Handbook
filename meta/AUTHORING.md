# Authoring Guide

__toc__

## Testing

To work on the Handbook:
```
 > npm run start
```
This will start a live development server at [http://localhost:8087](http://localhost:8087).
These pages will reload automatically on edits to page contents or CSS.

## Encouraged Lesser-Known Syntax

### Anchor Links

Use `{#anchor-name}` to specify a custom page anchor name on a header:

```
  ### My Section Title about Things I Like {#things-i-like}
```

## Special Syntax

### Inter-page Links

Use <tt>&lsqb;&lsqb;Section Name&rsqb;&rsqb;</tt> to link to a section anywhere in the Handbook or Reference Pages by its title.
The link text will always be the name of that section.

This accepts any combination of the following:
 * The title of the section
    * e.g. <tt>&lsqb;&lsqb;Function Expressions&rsqb;&rsqb;</tt> ⟹ [[Function Expressions]]
 * The anchor name itself with a leading `#` (even if this anchor is on another page)
    * e.g. <tt>&lsqb;&lsqb;#parameter-type-annotations&rsqb;&rsqb;</tt> ⟹ [[#parameter-type-annotations]]
 * The anchor name qualified by a page name
    * e.g. <tt>&lsqb;&lsqb;everyday-types#functions&rsqb;&rsqb;</tt> ⟹ [[everyday-types#functions]]
 * Any case-insensitive variant of the above
    * e.g. <tt>&lsqb;&lsqb;return type annotations&rsqb;&rsqb;</tt> ⟹ [[return type annotations]]

An error will be issued if a link is ambiguous.

### Table of Contents: `__toc__`

Write `__toc__` on a line by itself to insert the Table of Contents for a page.
See the top of this page for an example.

### Code Highlights: `^^^^^`

You can use carets to highlight a specific part of a code sample:
<pre>
function foo() {
         ^^^ Some text
}
</pre>

This will render as:
```ts
function foo() {
         ^^^ Some text
}
```

### Code QuickInfo Queries: `^?`

You can use `^?` to show the language service's quickinfo response at a location:

<pre>
function foo() {
}
foo();
 ^?
</pre>

This will render as:

```ts
function foo() {
}
foo();
 ^?
```

### `//cut` comments

Sometimes a code sample should be able to refer to declarations that you don't want to display in a sample.
Any code above a line containing only `//cut` will not be displayed, but the code will be highlighted and errored as if it were there.

### Code Sample Options

#### `@noErrors`

Disables display of errors in a sample

#### `@showEmit`

Displays the emitted JavaScript for a file

## Publishing

The site is published at https://microsoft.github.io/TypeScript-New-Handbook/outline/index.html via the `master` branch `docs` folder.
To update this copy, run `npm run publish`, review the diff, and commit and push the result.

## Walkthrough

The walkthrough is a series of pages which describe TypeScript, organized by concepts.

Each page of the walkthrough should:
 * Explain a single concept
 * Be 1200 words or less
 * Build on previous knowledge gained from prior pages

The scope of each walkthrough page is not intended to be exhaustive.
For example, the "compiler options" walkthrough page shouldn't list *every* option, just those that developers are most likely to need to know about.

Nearly every walkthrough page should start with a link to [MDN Documentation](https://developer.mozilla.org/en-US/) for "background reading".
We *don't* want to waste time documenting JavaScript features - our documentation should build on existing JS knowledge and resources.

### Key Concepts!


### Reading Level & Vocabulary

*Most* readers of this documentation will not be native English speakers. Keep the use of fancy words to a minumum; prefer short sentences and active-voice phrasing:

 > * ❌ Understandability can become obfuscated if too many type aliases are used, so in these positions an anonymous type is indicated.
 > * ✅ Using too many type aliases here can make the code unreadable. You can use an anonymous type instead.

### Voice (Walkthrough)

Consider using informal terms ("compatible with") when a technically-accurate description ("subtype of or assignable from") would interfere with understanding.

Use instructional, second-person narrative:

 > * ✅ You can detect errors like these with the `--strictNullChecks` option.
 > * ❌ Developers can use the `--strictNullChecks` option to detect errors like these.
 > * ❌ We encourage use of `--strict` in new codebase.

Use an approachable, but not overly chatty, level of formality:

 > * ✅ Consider using `--fancyTuples` if your codebase mostly has fancy arrays instead of normal ones.
 > * ❌ `--fancyTuples` alters the assignability relationship when the contextual type hints a tuple format.
 > * ❌ I'd say `--fancyTuples` is pretty sweet, because it'll really fix your arrays where they need it.

## Reference

Each reference article should provide a *complete*, spec-level explanation of a particular concept.
A reader who completely understands all reference articles should be educated at the level of one of our own developers.

### Voice (Reference)

In reference modules, *do* use technically-accurate descriptions.

Use third-person narrative:

 > * ✅ The `--strictNullChecks` option removes `null` and `undefined` from the domain of all types.
 > * ❌ If you use the `--strictNullChecks` option, we won't put `null` and `undefined` into the domain of all types.

