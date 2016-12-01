// NOTE: this is modified from https://github.com/dominictarr/connect-restreamer

module.exports = function (options) {
  options = options || {}
  options.property = options.property || 'body'
  options.stringify = options.stringify || JSON.stringify

  return function (req, res, next) {
    if(req.method==="POST") {
      req.removeAllListeners('data')
      req.removeAllListeners('end')
      if(req.headers['content-length'] !== undefined){
        req.headers['content-length'] = Buffer.byteLength(options.stringify(req[options.property]), 'utf8')
      }

      process.nextTick(function () {
        if(req[options.property]) {
          if('function' === typeof options.modify)
            req[options.property] = options.modify(req[options.property])
          req.emit('data', options.stringify(req[options.property]))
        }
        req.emit('end')
      });
    }
    next()
  }
}
