## Why Compile TypeScript to WebAssembly ##

1. Javascript, the Good Parts, but Faster

The speed comes from runtime type hints!

This is the *opposite* of Typescript's design philosophy, you know.
But it could get there with some tweaks.

2. Low-cost Way to Adopt New and Cool

Um, OK. What does this give you?
Remember that anything you adopt needs to be usable in a real app.
Like, your code needs to be *usable* with react. And it needs to be
*useful* with react -- that is, actually better than just writing
Javascript or Typescript.
Which leads us to the next question:

## Why Compile Anything to WebAssembly ##

1. Better experience with Javascript tools of today.

Some languages make claims to this effect. ReasonML and Elm are two I
think of immediately.

The problem here is the problem anytime somebody wants you to switch
languages but not libraries. The benefits have to be AMAZING and the
switching costs low for this to work.

Kotlin is the only recent example I can think of, and that's because
(1) Java was stuck for ages and ages (2) New programmers treat all the
features Java missed (closures, async, nullability) as basic.

2. Completely different applications.

Graphics, Bluetooth, etc. I don't know. The fundamental problem is
that you're still sandboxed by the browser so there isn't anything
you can do that Javascript can't, except for better language semantics.

And speed is rarely the problem.
And when it is, it's often best addressed by replacing a small component.
Or just rewriting the whole thing.

Games ported to the browser might benefit from being completely in
non-Javascript. But that's the only thing I can think of.

3. Displace the Javascript ecosystem entirely.

This is a great lifeline to communities that need to ship code to the
browser but hate the whole ecosystem (GWT, Script#, Clojurescript,
Blazor, Haskell, etc, etc). But it's been possible to do
this for a long time, and all the languages I know of already target
Javascript. It seems unlikely that WebAssembly will make a difference.

### Where Does Typescript Fit In ###

Well, it's not going to displace Javascript's ecosystem.

And it's not ever going to be suitable for fundamentally different
applications. You can fool yourself about this point if you talk fast
and don't think about implementing all of Javascript's runtime
semantics. Or you can fool yourself into thinking that Typescript syntax
for low-level code would help significantly.

And there's no better experience with Typescript targetting
WebAssembly vs Javascript. You might as well compile Javascript to
WebAssembly.

## Why Compile Javascript to WebAssembly ##

So what people really want is Javascript, but faster, and sound(er),
and with just the good parts.

Fine. Those are good things to want.

But can you have those and still work with Javascript?

Mmmm.. Soundscript says no.
