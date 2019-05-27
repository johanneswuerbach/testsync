const sync = require('./index')

async function test(name, fn, timeout = 500) {
  try {
    if (timeout) {
      let tid
      await Promise.race([
        new Promise((_resolve, reject) => {
          tid = setTimeout(() => reject(new Error(`Timeout after ${timeout} ms`)), timeout)
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
    console.log(`[pass] ${name}`)
  } catch(e) {
    process.exitCode = 1
    console.log(`[fail] ${name}: ${e.message}`)
    console.log(e.stack)
  }
}

test('Syncing two per usual', async () => {
  const [first] = sync(2)

  await Promise.all([first, first])
})

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

test('Can be chained', async () => {
  const [two] = sync()

  const [foo, bar] = await Promise.all([two.then(() => 'foo'), two.then(() => 'bar')])
  if (foo !== 'foo') {
    throw new Error('Expected foo, got ' + foo)
  }
  if (bar !== 'bar') {
    throw new Error('Expected bar, got ' + bar)
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
