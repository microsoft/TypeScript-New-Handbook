TypeScript determines what files belong to your program by a combination of reading your `tsconfig.json` or commandline, enumerating files on disk, and following references in source files to find additional source files.
This process is complex by nature and it can be confusing to understand how all these options interact.

__toc__

## Overview

The core process used to construct the list of files in your program consists of two steps:
 1. Determine a list of *root files*
 2. Resolve any references or imports in these root files, doing so recursively until no new additional files are found.

As this process occurs, an *ordering* of files is also created.
File ordering affects emit when using `--outFile`, and affects type checking in a few ways (see [[declaration merging]]).
If a particular step doesn't specify an impact on file ordering, you should assume that the ordering is arbitrary and may change for any reason.

## Step-by-Step

More precisely, the following steps occur, which are described in order below.

### Add default libs

Based on the compiler settings [[lib]], [[noLib]], and [[target]], some of the built-in `.d.ts` files (such as `es5.d.ts`) are included in the program.
These files are always first in the file ordering.

### Apply `includes` and `excludes`

First, any `include` and `exclude` patterns from `tsconfig.json` are resolved.
Patterns from `exclude` take priority here; a file that is matched by both `include` and `exclude` is *not* considered a root file.

**From this point forward, `exclude` patterns have no effect**.
`exclude` *only* masks files from being included due to `include`.
Files matching `exclude` might still be added to the program as a result of being in the `files` list, reference resolution, type directive resolution, or module resolution.

The ordering of files from `include` is not specified.

### Apply `files` list

Files from the `files` list are added to the root files list in the order they appear.

At this point, a complete list of *root filenames* has been constructed.

### Determine automatic type directives

If the `types` option is not specified, a list of *automatic* type directives is computed instead.
This is computed by taking the directory name of each direct subfolder of each of the `typeRoots`; any `typeRoots` entry that doesn't exist is skipped.
These directives are resolved later.

### Process root files

Each *root file* is *processed*.

When a file is *processed*, TypeScript resolves any dependencies found in the text of the source file:
 * Module imports such as `import * from "./other"`
 * Reference directives such as `/// <reference path="other.ts" />`
 * Library directives such as `/// <reference lib="es6" />`
 * Type directives such as `/// <reference types="node" />` 

Any file found as a result of these is immediately itself processed (unless it was already processed).
Files are always placed *after* their dependencies in the file ordering list, unless a circularity exists, in which case the order is not specified.
This process may cause *re-ordering* - a set of root names from `files` end up with a different ordering due to `reference` comments, for example.

<!-- TODO finish -->

### Process type directives

The type directives from `types` (or the automatic type directive list) are resolved.


