# Distributed Procedure Calls using AMQP

[![Travis](https://img.shields.io/travis/com/ovhemert/dpc.svg?branch=master&logo=travis)](https://travis-ci.com/ovhemert/dpc)
[![AppVeyor](https://img.shields.io/appveyor/ci/ovhemert/dpc.svg?logo=appveyor)](https://ci.appveyor.com/project/ovhemert/dpc)
[![Dependencies](https://img.shields.io/david/ovhemert/dpc.svg)](https://david-dm.org/ovhemert/dpc)
[![Known Vulnerabilities](https://snyk.io/test/npm/dpc/badge.svg)](https://snyk.io/test/npm/dpc)
[![Coverage Status](https://coveralls.io/repos/github/ovhemert/dpc/badge.svg?branch=master)](https://coveralls.io/github/ovhemert/dpc?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/ovhemert/dpc.svg)](https://greenkeeper.io/)
[![npm](https://img.shields.io/npm/v/dpc.svg)](https://www.npmjs.com/package/dpc)
[![npm](https://img.shields.io/npm/dm/dpc.svg)](https://www.npmjs.com/package/dpc)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

This library provides a super easy way to declare and call remote functions from your services. You can run a single instance or scale to thousands. It's up to you!

Do you want to use callbacks, promises or async/await? All covered!

Instances do not need to be aware of each other's existence. The first instance that is available to pick up the function call, will process it, and send back the results.
This way, remote procedure calls (rpc) will be handled in a distributed system: distributed procedure calls (dpc).

## Requirements

### Message Broker
The library uses AMQP to setup communication between the instances. You need to have a compatible message broker available like [RabbitMQ](https://www.rabbitmq.com).

The fastest way to get started is by signing up for a service that hosts RabbitMQ for you, like [CloudAMQP](https://www.cloudamqp.com). No configuration needed, and with the free plan, you get plenty for free.

Alternatively, you can install RabbitMQ on you local machine. Refer to "[Downloading and Installing RabbitMQ](https://www.rabbitmq.com/download.html)" for the different installation methods depending on your environment.

## Installation

```
npm i dpc
```

## Usage

This is a full example on how to use the library to connect to a broker, register a function, and execute this function.

If you only run a single instance of this snippet, the function will actually be executed on the same instance that was calling the function.
When multiple versions of this snippet are running, any of the attached instances could execute the function.

```js
const DPC = require('dpc')

// create a new dpc instance
const dpc = new DPC()
// connect to the broker
dpc.connect({ url: 'amqp://guest:guest@localhost:5672' }).then(() => {
  // create the function that we want to execute remotely
  function sumNumbers (params, cb) {
    const numbers = params.numbers || []
    const res = numbers.reduce((a, b) => a + b, 0)
    return cb(null, res)
  }
  // register this function with dpc
  dpc.register(sumNumbers)
  // execute the function through dpc
  dpc.functions.sumNumbers({ numbers: [1, 2, 3] }, function (err, res) {
    if (err) { return console.error(err) }
    console.log(`sumNumbers: ${res}`)
  })
}).catch(err => {
  // something went wrong
  console.log(err)
})
```

## API

See the [API.md](./docs/API.md) file for details.

## Maintainers

**Osmond van Hemert**

[![Github](https://img.shields.io/badge/style-github-333333.svg?logo=github&logoColor=white&label=)](https://github.com/ovhemert)
[![NPM](https://img.shields.io/badge/style-npm-333333.svg?logo=npm&logoColor=&label=)](https://www.npmjs.com/~ovhemert)
[![Twitter](https://img.shields.io/badge/style-twitter-333333.svg?logo=twitter&logoColor=&label=)](https://twitter.com/osmondvanhemert)
[![Web](https://img.shields.io/badge/style-website-333333.svg?logoColor=white&label=&logo=diaspora)](https://www.osmondvanhemert.nl)

## Contributing

See the [CONTRIBUTING.md](./docs/CONTRIBUTING.md) file for details.

## Donations

Want to help me out by giving a donation? Check out these options:

[![Patreon](https://img.shields.io/badge/style-patreon-333333.svg?logo=patreon&logoColor=&label=)](https://www.patreon.com/ovhemert)
[![Coinbase](https://img.shields.io/badge/style-bitcoin-333333.svg?logo=bitcoin&logoColor=&label=)](https://commerce.coinbase.com/checkout/fd177bf0-a89a-481b-889e-22bfce857b75)
[![PayPal](https://img.shields.io/badge/style-paypal-333333.svg?logo=paypal&logoColor=&label=)](https://www.paypal.me/osmondvanhemert)
[![Ko-fi](https://img.shields.io/badge/style-coffee-333333.svg?logo=ko-fi&logoColor=&label=)](http://ko-fi.com/ovhemert)

## License

MIT
