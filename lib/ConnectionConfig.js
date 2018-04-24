var random = require("random-js")();

module.exports = ConnectionConfig;
function ConnectionConfig(options) {
  if (typeof options === 'string') {
    options = ConnectionConfig.parseUrl(options);
  }

  this.host               = options.host || 'localhost';
  this.port               = options.port || 9999;
  this.clientid           = options.clientid || ConnectionConfig.generateClientID();
  this.connectTimeout     = (options.connectTimeout === undefined)
    ? (10 * 1000)
    : options.connectTimeout;
  this.debug              = options.debug;
  this.trace              = options.trace !== false;
  this.pool               = options.pool || undefined;
  this.ssl                = options.ssl || false;

  if (this.ssl) {
    // Default rejectUnauthorized to true
    this.ssl.rejectUnauthorized = this.ssl.rejectUnauthorized !== false;
  }
}

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

ConnectionConfig.generateClientID = function generateClientID() {
  var prefix = 'NJS';
  var value = random.integer(1, 99999);

  var newClientID = prefix + value.pad(5);
  return newClientID;
};
