const handleAsync = (requestHandler) => (req, res, next) => {
  requestHandler(req, res).catch(next)
}

module.exports = { handleAsync }
