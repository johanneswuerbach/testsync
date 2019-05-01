'use strict'

function * sync(count = 2) {
  while (1) {
    let i = count
    let resolve
    const p = new Promise(r => { resolve = r })
    const then = p.then
    p.then = function () {
      then.apply(this, arguments)
      --i
      if (i <= 0) {
        p.then = then
        resolve()
      }
    }
    yield p
  }
}

module.exports = sync.sync = sync.default = sync
