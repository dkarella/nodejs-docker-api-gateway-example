var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('/api/v1/hello', function(req, res) {
  let gatewayMsg = req.headers['gateway-message'];
  if(gatewayMsg) {
    gatewayMsg = JSON.parse(gatewayMsg);
  }
  res.json({
    message: 'hello',
    query: req.query,
    body: req.body,
    'gateway-message': gatewayMsg
  });
});

module.exports = app;
