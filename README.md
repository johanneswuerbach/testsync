# [TestSync](https://github.com/twooster/testsync): A Helper for Testing Intricate Async Logic

TestSync is a little helper library to aid in testing intricate ordering of
asynchronous code in Javascript. TypeScript typings are included. This library
is considered feature complete and no new features will be added.

## Installation

You probably want to use this library as a dev dependency:

```shell
npm install --save-dev testsync
```

## Motivation

Sometimes you need to build intricate test cases around asynchronous logic to
ensure that, given certain ordering of operations of asynchronous code, things
still operate correctly. This can be tricky to guarantee in any asynchronous
system! This library can help.

It does this by providing "synchronization points" (promises) that can be
`await`ed in your code. Once awaited enough times, the synchronization promises
will automatically resolved, and your code will continue.

## Example

Imagine you have an asynchronous cache, and you want to validate that given a
certain order of operations on that cache, things behave as expected. How might
you test that? With testsync, it's easy:

```javascript
const sync = require('testsync')

const [precache, cached] = sync()

const url = 'http://example.org'
const cache = new AsyncCache()

async function worker1() {
  const data = await fetchUrl(url)
  await precache
  await cache.set(url, data)
  await cached
}

async function worker2() {
  expect(await cache.get(url)).to.be.undefined
  await precache
  await cached
  expect(await cache.get(url)).to.be.ok
}

await Promise.all([worker1(), worker2()])
```

## Usage

The API is very simple. First import the `sync` function (all of the below
will work equivalently):

```javascript
const { sync } = require('testsync')
const sync = require('testsync')
import sync from 'testsync'
import { sync } from 'testsync'
```

The `sync` method has the signature:

```javascript
function * sync(awaitCount = 2)
```

This is a generator function that returns as many synchronization points as
you'd like. They will resolve only when they've been `await`ed (or `.then`d)
the specified (`count`, default 2) number of times. The promise will
never throw.

To create new promises, use destructuring:

```javascript
const [beforeUpdate, afterUpdate, afterSave] = sync()
const [threeWaySyncPoint] = sync(3)
```

You can create as many synchronization points as you like this way. Afterwards,
just await them as normal (from within separate async contexts, obviously), and
when the promise is being awaited in the minimum number of places, it will
automatically resolve:

```javascript
const [a, b]

await Promise.all([
  new Promise(resolve => {
    await a
    await b
    resolve()
  }),
  new Promise(resolve => {
    await a
    await b
    resolve()
  })
])
```

### Further Semantics

```javascript
const [a, b, c] = sync()     // equivalent to sync(2)
await Promise.all([a, a])    // resolves, `a` is awaited twice
await Promise.all([b])       // never resolves, only awaited once
await Promise.all([c, c, c]) // can be awaited more than `count` times

const [d, e] = sync(3)
await Promise.all([d, d])    // again never resolves, must be awaited 3 times
await Promise.all([e, e, e]) // resolves
```

## License

MIT
