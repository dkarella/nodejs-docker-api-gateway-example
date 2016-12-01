module.exports = function(req, res, next) {
  let message = { message: 'Hello from the API Gateway!' };
  req.headers['gateway-message'] = JSON.stringify(message);
  next();
};
