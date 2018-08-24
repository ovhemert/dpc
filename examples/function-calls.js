'use strict'

const DPC = require('../src/')

const main = async () => {
  // connect
  const dpc = new DPC()
  await dpc.connect()

  // register function
  dpc.register(function sumNumbers (params, cb) {
    const numbers = params.numbers || []
    const res = numbers.reduce((a, b) => a + b, 0)
    console.log(`sumNumbers (working): ${res}`)
    return cb(null, res)
  }, { remoteOnly: false })

  // call function with callback
  dpc.functions.sumNumbers({ numbers: [1, 2, 3] }, function (err, result) {
    if (err) { return console.error(err) }
    console.log(`sumNumbers (callback): ${result}`)
  })

  // call function with promise
  dpc.functions.sumNumbers({ numbers: [2, 3, 4] }).then(result => {
    console.log(`sumNumbers (promise): ${result}`)
  }).catch(err => {
    console.error(err)
  })

  // call function with async/await
  try {
    const result = await dpc.functions.sumNumbers({ numbers: [3, 4, 5] })
    console.log(`sumNumbers (async/await): ${result}`)
  } catch (err) {
    console.error(err)
  }
}

main()
