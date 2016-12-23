const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const url = require('url')
const path = require('path');
const logger = require('morgan');
const services = require('./services.json');
const proxy = require('./lib/proxy');
const restreamer = require('./lib/restreamer');

// set up the app
const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', function(req, res) {
  res.json({
    message: "API Gateway is alive."
  });
});

// Bootstrap services
for(let i = 0; i < services.length; i++) {
  const name = services[i].name;
  const host = services[i].host;
  const port = services[i].port;
  const rootPath = services[i].rootPath || "";
  const protocol = services[i].protocol || "http";

  console.log(`Boostrapping service: ${protocol}://${host}:${port}/${rootPath}`);

  let middleware = [];
  if(services[i].middleware) {
    middleware = services[i].middleware.map(text => require(`./middleware/${text}`));
  }

  // need to restream the request so that it can be proxied
  middleware.push(restreamer());

  app.use(`/api/${name}*`, middleware, (req, res, next) => {
    const newPath = url.parse(req.originalUrl).pathname.replace(`/api/${name}`, rootPath);
    console.log(`Forwarding request to: ${newPath}`);
    proxy.web(req, res, { target: `${protocol}://${host}:${port}/${newPath}` }, next);
  });
}

module.exports = app;
