# [TestSync](https://github.com/twooster/testsync): A Helper for Testing Intricate Async Logic

TestSync is a little helper library to aid in testing intricate ordering of
asynchronous code in Javascript.


## Installation

```shell
npm install --save testsync
```

## Purpose

Sometimes you need to build intricate test cases around asynchronous logic to
ensure that, given certain ordering of operations of asynchronous code, things
still operate correctly. This can be tricky to guarantee in any asynchronous
system! This library can help.

It does this by providing "synchronization points" (promises) that can be
`await`ed in your code. Once awaited enough times, the synchronization promises
will be resolved, and your code can continue.

## Usage

The API is very simple. The `sync` method has the signature:

`function * sync(count = 2)`

This is a generator function that returns as many synchronization points as
you'd like, each one requiring at least two `await` or `.then` calls in order
to automatically resolve the promise. The promise will never throw.

For example:

```
const [a, b, c] = sync() // equivalent to sync(2)
await Promise.all([a, a]) // resolves, `a` is awaited twice
await Promise.all([b]) // never resolves, only awaited once
await Promise.all([c, c, c]) // can be awaited more than once

const [threeA, threeB] = sync(3)
await Promise.all([threeA, threeA]) // again never resolves, must be awaited 3 times
await Promise.all([threeB, threeB, threeB]) // resolves
```

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
  expect(await cache.get(url)).to.be.ok()
}

await Promise.all([worker1, worker2])
```

## License

MIT
