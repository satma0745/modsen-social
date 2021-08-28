const modelToDto = (model) => {
  const dto = model.toObject()

  dto.id = dto._id
  delete dto._id
  delete dto.__v

  return dto
}

module.exports = { modelToDto }
