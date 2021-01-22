'use strict'

function * sync(count = 2) {
  while (1) {
    let waiters = []
    const then = function(onFulfilled, onReject) {
      let resolve, reject

      const p = new Promise((res, rej) => {
        resolve = res
        reject = rej
      }).then(onFulfilled, onReject)

      if (waiters) {
        waiters.push(resolve)
        if (waiters.length === count) {
          const tmp = waiters
          waiters = undefined
          for (const waiter of tmp) {
            waiter()
          }
        }
      } else {
        resolve()
      }

      return p
    }
    yield ({
      then,
      catch(fn) {
        return this.then(v => v, fn)
      },
      finally(fn) {
        return this.then(fn)
      }
    })
  }
}

module.exports = sync.sync = sync.default = sync
