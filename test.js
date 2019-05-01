const sync = require('./index')

async function test(name, fn, timeout = 1000) {
  try {
    if (timeout) {
      let tid
      await Promise.race([
        new Promise((_resolve, reject) => {
          tid = setTimeout(() => reject(new Error('Timeout after ' + timeout + ' ms')), timeout)
        }),
        new Promise(resolve => resolve(fn())).then(
          res => {
            clearTimeout(tid)
          },
          err => {
            clearTimeout(tid)
            throw err
          }),
      ])
    } else {
      await new Promise(resolve => resolve(fn()))
    }
    console.log('[pass] ' + name)
  } catch(e) {
    console.log('[fail] ' + name + ': ' + e.message)
    console.log(e.stack)
  }
}

test('Syncing two per usual', async () => {
  const [first] = sync(2)

  await Promise.all([first, first])
}, 100)

test('Interleaving unrelated promises', async () => {
  const [ready, done] = sync(2)

  const p1 = new Promise(async res => {
    await ready
    await new Promise(r => setImmediate(r))
    await done
    res()
  })

  const p2 = new Promise(async res => {
    await new Promise(r => setImmediate(r))
    await ready
    await done
    res()
  })

  await p1
  await p2
})

test('Two different sync generators with different counts', async () => {
  const [three] = sync(3)
  const [two] = sync(2)

  await Promise.all([two, two])
  await Promise.all([three, three, three])
})

test('Never syncing', async () => {
  const [two] = sync(2)

  const result = await Promise.race([
    two,
    new Promise(resolve => setTimeout(() => resolve('timeout'), 10))
  ])
  if (result !== 'timeout') {
    throw new Error('Unexpected promise resolution')
  }
})

test('Oversyncing has no problems', async () => {
  const [two] = sync()

  await Promise.all([two, two, two])
})

test('Defaults to two', async () => {
  const [twoA, twoB] = sync()

  const result = await Promise.race([
    twoA,
    new Promise(resolve => setTimeout(() => resolve('timeout'), 10))
  ])
  if (result !== 'timeout') {
    throw new Error('Unexpected promise resolution')
  }

  await Promise.all([twoB, twoB])
})

test('Throws on negative counts', async () => {
  await new Promise(resolve => {
    resolve(sync(-1))
  }).then(() => {
    throw new Error('Expected an error')
  }, err => err)
})
