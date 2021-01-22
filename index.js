'use strict'

function resolvable (fn) {
  let r;
  const p = new Promise((resolve) => {
    r = resolve
  })

  return { promise: p, resolve: () => r(fn()) }
}

function * sync(count = 2) {
  while (1) {
    const waiters = []

    yield {
      then: (fn) => {
        const resolvableWaiter = resolvable(fn)
        waiters.push(resolvableWaiter);

        if (waiters.length >= count) {
          for (const waiter of waiters) {
            waiter.resolve()
          }
        }

        return resolvableWaiter.promise
      }
    }
  }
}

module.exports = sync.sync = sync.default = sync
