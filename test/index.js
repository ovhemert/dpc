const DPC = require('../src')
// const os = require('os')

const main = async () => {
  // connect
  const dpc = new DPC()
  await dpc.connect()

  // register functions
  // dpc.register('getFullName', (params, cb) => {
  //   const fullname = `Fullname = ${params.first} ${params.last}`
  //   return cb(null, fullname)
  // })

  // dpc.register(function getHostname (params, cb) {
  //   const name = os.hostname()
  //   return cb(null, name)
  // })

  // function getPlatform (params, cb) {
  //   return cb(null, os.platform())
  // }
  // dpc.register(getPlatform)

  // dpc.register((params, cb) => {
  //   return cb(null, os.platform())
  // })

  dpc.register(function sumNumbers (params, cb) {
    const numbers = params.numbers // || []
    const res = numbers.reduce((a, b) => a + b, 0)
    return cb(null, res)
  })

  // execute functions

  // dpc.functions.getFullName({ first: 'Osmond', last: 'van Hemert' }).then(res => {
  //   console.log(res)
  // }).catch(err => {
  //   console.error(err)
  // })

  // dpc.functions.getHostname(null, function (err, res) {
  //   if (err) { return console.error(err) }
  //   console.log(`getHostname: ${res}`)
  // })

  // dpc.functions.getPlatform(null, function (err, res) {
  //   if (err) { return console.error(err) }
  //   console.log(`getPlatform: ${res}`)
  // })

  dpc.functions.sumNumbers({ numbers: [1, 2, 3] }, function (err, res) {
    if (err) { return console.error(err) }
    console.log(`sumNumbers A: ${res}`)
  })

  dpc.functions.sumNumbers({ numbers: [4, 5, 6] }, function (err, res) {
    if (err) { return console.error(err) }
    console.log(`sumNumbers B: ${res}`)
  })

  dpc.functions.sumNumbers({}, function (err, res) {
    if (err) { return console.error(err) }
    console.log(`sumNumbers C: ${res}`)
  })
}

main()
