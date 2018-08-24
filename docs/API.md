# API

Describes the functions available.

## .connect(options)
*returns: Promise*

Connects dpc instance to the broker.

```js
const DPC = require('dpc')
const dpc = new DPC()

dpc.connect({ url: 'amqp://guest:guest@localhost:5672' }).then(() => {
  // ..s
}).catch(err => {
  console.log(err)
})
```
