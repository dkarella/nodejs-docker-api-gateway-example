const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req,res){
  res.json({
    hello: 'world!'
  });
});

app.all('/api/v1/hello', function(req, res) {
  const response = {
    message: 'hello',
    query: req.query,
    body: req.body,
  };

  let gatewayMsg = req.headers['gateway-message'];
  if(gatewayMsg) {
    response['gateway-message'] = JSON.parse(gatewayMsg);
  }

  res.json(response);
});

module.exports = app;
