const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();
module.exports = proxy;
