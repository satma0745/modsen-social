const handleAsync = (requestHandler) => (req, res, next) => {
  requestHandler(req, res).catch(next)
}

const toDto = (model) => {
  const dto = model.toObject()

  dto.id = dto._id
  delete dto._id

  delete dto.__v

  return dto
}

module.exports = { handleAsync, toDto }
