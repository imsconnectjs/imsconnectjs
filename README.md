---
permalink: README.html
---

# imsconnectjs
node.js library to access IMS transactions running in the IMS Transaction Manager (IMS TM) through IMS Connect
Work is in progress - no code available yet.

## Table of Contents

- [Install](#install)
- [Introduction](#introduction)
- [Contributors](#contributors)
- [Sponsors](#sponsors)
- [Community](#community)
- [Establishing connections](#establishing-connections)
- [SSL options](#ssl-options)
- [Terminating connections](#terminating-connections)
- [Pooling connections](#pooling-connections)
- [Todo](#todo)

## Install

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.6 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install imsconnectjs
```

For information about the previous 0.9.x releases, visit the [v0.9 branch][].

Sometimes I may also ask you to install the latest version from Github to check
if a bugfix is working. In this case, please do:

```sh
$ npm install imsconnectjs/imsconnectjs
```

[v0.9 branch]: https://github.com/imsconnectjs/imsconnectjs/tree/v0.9

## Introduction

This is a node.js driver for IMS Connect. It is written in JavaScript, does not
require compiling, and is 100% MIT licensed.

Here is an example on how to use it:

```js
var imsconnect = require('imsconnectjs');
var connection = imsconnect.createConnection({
  host      : 'localhost',
  user      : 'me',
  password  : 'secret',
  datastore : 'my_ds'
});

connection.connect();

connection.executeString('IVTNV     DIS     LAST1     ', function (error, reply) {
  if (error) throw error;
  console.log('The reply is: ', reply[0]);
});

connection.end();
```

From this example, you can learn the following:

* Every method you invoke on a connection is queued and executed in sequence.
* Closing the connection is done using `end()` which makes sure all remaining
  messages are executed before sending a quit packet to the imsconnect server.

## Contributors

Thanks goes to the people who have contributed code to this module, see the
[GitHub Contributors page][].

[GitHub Contributors page]: https://github.com/imsconnectjs/imsconnectjs/graphs/contributors

Additionally I'd like to thank the following people:

* [Dirk Gerog][] (Harmundi) - for helping me with protocol questions.

[Dirk Gerog]: http://www.harmundi.com/

## Sponsors

The following companies have supported this project financially, allowing me to
spend more time on it (ordered by time of contribution):

* [Harmundi](http://www.harmundi.com/)

## Community

If you'd like to discuss this module, or ask questions about it, please use one
of the following:

* **TDB**: https://www.harmundi.com/forum

## Establishing connections

The recommended way to establish a connection is this:

```js
var imsconnect = require('imsconnectjs');
var connection = imsconnect.createConnection({
  host      : 'localhost',
  user      : 'me',
  password  : 'secret',
  datastore : 'my_ds'
});


connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});
```

However, a connection can also be implicitly established by invoking a query:

```js
var imsconnect = require('imsconnectjs');
var connection = imsconnect.createConnection(...);

connection.executeString('IVTNV     DIS     LAST1     ', function (error, reply) {
  if (error) throw error;
  // connected!
});
```

Depending on how you like to handle your errors, either method may be
appropriate. Any type of connection error (handshake or network) is considered
a fatal error, see the [Error Handling](#error-handling) section for more
information.

### SSL options

The `ssl` option in the connection options takes an object. When connecting to IMS Connect servers, you will need to provide an object of options, in the
same format as [tls.createSecureContext](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options).
Please note the arguments expect a string of the certificate, not a file name to the
certificate. Here is a simple example:

```js
var connection = imsconnect.createConnection({
  host : 'localhost',
  ssl  : {
    ca : fs.readFileSync(__dirname + '/imsconnect-ca.crt')
  }
});
```

You can also connect to an IMS Connect server without properly providing the appropriate
CA to trust. _You should not do this_.

```js
var connection = imsconnect.createConnection({
  host : 'localhost',
  ssl  : {
    // DO NOT DO THIS
    // set up your ca correctly to trust the connection
    rejectUnauthorized: false
  }
});
```

## Terminating connections

There are two ways to end a connection. Terminating a connection gracefully is
done by calling the `end()` method:

```js
connection.end(function(err) {
  // The connection is terminated now
});
```

This will make sure all previously enqueued queries are still before sending a
deallocate request to the IMS Connect server. If a fatal error occurs before the
deallocate request can be sent, an `err` argument will be provided to the
callback, but the connection will be terminated regardless of that.

An alternative way to end the connection is to call the `destroy()` method.
This will cause an immediate termination of the underlying socket.
Additionally `destroy()` guarantees that no more events or callbacks will be
triggered for the connection.

```js
connection.destroy();
```

Unlike `end()` the `destroy()` method does not take a callback argument.

## Pooling connections

Rather than creating and managing connections one-by-one, this module also
provides built-in connection pooling using `imsconnect.createPool(config)`.
[Read more about connection pooling](https://en.wikipedia.org/wiki/Connection_pool).

Use pool directly.
```js
var imsconnect = require('imsconnectjs');
var pool       = imsconnect.createPool({
  connectionLimit : 10,
  host            : 'example.org',
  user            : 'bob',
  password        : 'secret',
  datastore       : 'my_ds'
});

pool.executeString('IVTNV     DIS     LAST1     ', function (error, reply) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
```

Connections can be pooled to ease sharing a single connection, or managing
multiple connections.

```js
var imsconnect = require('imsconnectjs');
var pool       = imsconnect.createPool({
  host     : 'example.org',
  user     : 'bob',
  password : 'secret',
  datastore : 'my_ds'
});

pool.getConnection(function(err, connection) {
  // connected! (unless `err` is set)
});
```

When you are done with a connection, just call `connection.release()` and the
connection will return to the pool, ready to be used again by someone else.

```js
var imsconnect = require('imsconnectjs');
var pool       = imsconnect.createPool(...);

pool.getConnection(function(err, connection) {
  // Use the connection
  connection.executeString('IVTNV     DIS     LAST1     ', function (error, reply) {
    // And done with the connection.
    connection.release();

    // Handle error after the release.
    if (error) throw error;

    // Don't use the connection here, it has been returned to the pool.
  });
});
```

If you would like to close the connection and remove it from the pool, use
`connection.destroy()` instead. The pool will create a new connection the next
time one is needed.

Connections are lazily created by the pool. If you configure the pool to allow
up to 100 connections, but only ever use 5 simultaneously, only 5 connections
will be made. Connections are also cycled round-robin style, with connections
being taken from the top of the pool and returning to the bottom.

When a previous connection is retrieved from the pool, a ping packet is sent
to the server to check if the connection is still good.

## Todo

* Everything
* Simplest case for calling an IMS transaction with Single Segment Message, Commit Mode 1, Synclevel None
