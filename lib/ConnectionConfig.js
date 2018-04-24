module.exports = ConnectionConfig;
function ConnectionConfig(options) {
  if (typeof options === 'string') {
    options = ConnectionConfig.parseUrl(options);
  }

  this.host               = options.host || 'localhost';
  this.port               = options.port || 9999;
  this.clientid           = options.clientid || undefined;
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
