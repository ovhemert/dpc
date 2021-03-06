# API

Describes the functions available.

## .connect(options)
*returns: Promise*

Connects dpc instance to the broker.

```js
const DPC = require('dpc')
const dpc = new DPC()

dpc.connect({ url: 'amqp://guest:guest@localhost:5672' }).then(() => {
  // ...
}).catch(err => {
  console.log(err)
})
```

## .functions.<*function*>(params, [callback])

Executes a registered function and returns the result in a callback/promise.

```js
  // call function with callback
  dpc.functions.sumNumbers({ numbers: [1, 2, 3] }, function (err, res) {
      if (err) { return console.error(err) }
      console.log(`sumNumbers: ${res}`)
    })
```

### function

This is the name of the function that was added using the `.register` command.

### params

A serializable object that holds the arguments to pass into the function.

### callback

An optional callback that waits for the result from the remote function. If no callback is specified, the function returns a promise.

```js
  // call function with promise
  dpc.functions.sumNumbers({ numbers: [2, 3, 4] }).then(result => {
    console.log(result)
  }).catch(err => {
    console.error(err)
  })
```

Instead of a promise, you could also you `async/await`.

```js
  // call function with async/await
  try {
    const result = await dpc.functions.sumNumbers({ numbers: [3, 4, 5] })
    console.log(result)
  } catch (err) {
    console.error(err)
  }
```

## .register(function, options)

Register the function that we want to execute (local or remote)

```js
  dpc.register(function sumNumbers (params, cb) {
    const numbers = params.numbers || []
    const res = numbers.reduce((a, b) => a + b, 0)
    return cb(null, res)
  }, { remoteOnly: false })
```

### function

This must be a *named* function that has only 2 arguments:

- *params*: a serializable object with the values needed to execute the function
- *cb*: a callback function with the arguments:
  - *err*: the error to be returned if the function fails
  - *res*: the result of the function execution

### options

This is an optional object that can have the following properties:

**broadcast**: `true` / `false` (default)

To allow a function to be executed by multiple instances, pass in the broadcast flag with value `true`. This will send the request to all connected instances, and wait for the timeout `ttl` to return the results. If an instance returns an error, the function will immediately return with this error.

In case of a broadcast, the result will always be an array.

**remoteOnly**: `true` / `false` (default)

All instances of dpc will listen to the same queue. This means that an instance that sends a request to execute a function, can also receive that request.

To execute a function only on a remote instance, specify `true`. To also allow the same process to execute the function, specify `false`. If there is only 1 instance connected to the queue, then `false` (the default) will make sure that the function is always executed and `true` will not find a remote, and causes a timeout.

**ttl**: `1000` (default)

The amount of milliseconds to wait before the callback is triggered with a timeout-error. If the execution of a function is triggered, but there are no listeners to handle the request, this will make sure that the function always returns.

If you have long-running functions, you can increase the number that best suits your situation.
