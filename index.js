'use strict'

function sync(syncCount = 2) {
  if (syncCount < 0) {
    throw new Error('Cannot have a sync count less than 0')
  }
  return _sync(syncCount)
}

function * _sync(syncCount) {
  while (true) {
    let i = syncCount
    let resolve
    const p = new Promise(res => { resolve = res })
    const oldThen = p.then
    p.then = function (cb, errb) {
      oldThen.call(this, cb, errb)
      if (i > 0) {
        --i
        if (i === 0) {
          p.then = oldThen
          resolve(sync)
        }
      }
    }
    yield p
  }
}

sync.sync = sync
sync.default = sync
module.exports = sync
