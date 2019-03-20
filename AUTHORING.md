# Authoring Guide

## Testing

To work on the Handbook:
```
 > npm run start
```
This will start a live development server at [http://localhost:8087](http://localhost:8087).
These pages will reload automatically on edits to page contents or CSS.

## Special Syntax

#### Table of Contents: `__toc__`

Write `__toc__` on a line by itself to insert the Table of Contents for a page

#### Code Highlights: `^^^^^`

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

#### `//cut` comments

Sometimes a code sample should be able to refer to declarations that you don't want to display in a sample.
Any code above a line containing only `//cut` will not be displayed, but the code will be highlighted and errored as if it were there.

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

