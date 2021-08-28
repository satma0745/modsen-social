const { modelToDto } = require('./shared')

const toUserDto = (userModel) => {
  const dto = modelToDto(userModel)
  delete dto.password

  return dto
}

const toUserDtos = (userModels) => {
  return userModels.map(toUserDto)
}

module.exports = { toUserDto, toUserDtos }
