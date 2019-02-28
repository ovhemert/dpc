# Distributed Procedure Calls using AMQP

[![Travis](https://img.shields.io/travis/com/ovhemert/dpc.svg?branch=master&logo=travis)](https://travis-ci.com/ovhemert/dpc)
[![AppVeyor](https://img.shields.io/appveyor/ci/ovhemert/dpc.svg?logo=appveyor)](https://ci.appveyor.com/project/ovhemert/dpc)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6c7db239873b4d1eaa4f7e268aadccff)](https://www.codacy.com/app/ovhemert/dpc?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ovhemert/dpc&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/npm/dpc/badge.svg)](https://snyk.io/test/npm/dpc)
[![Coverage Status](https://coveralls.io/repos/github/ovhemert/dpc/badge.svg?branch=master)](https://coveralls.io/github/ovhemert/dpc?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/ovhemert/dpc.svg)](https://greenkeeper.io/)
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

```sh
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

Osmond van Hemert
[![Github](https://img.shields.io/badge/-website.svg?style=social&logoColor=333&logo=github)](https://github.com/ovhemert/about)
[![Web](https://img.shields.io/badge/-website.svg?style=social&logoColor=333&logo=nextdoor)](https://www.osmondvanhemert.nl)

## Contributing

See the [CONTRIBUTING](./docs/CONTRIBUTING.md) file for details.

## License

MIT
