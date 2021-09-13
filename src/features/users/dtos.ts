import { IUser } from '../../models'

interface IUserDto {
  id: string
  username: string
  headline: string
  likes: number
}

type ToUserDto = (user: IUser) => IUserDto
const toUserDto: ToUserDto = (userModel) => ({
  id: userModel._id.toString(),
  username: userModel.username,
  headline: userModel.profile.headline,
  likes: userModel.profile.likedBy.length,
})

type ToUserDtos = (users: IUser[]) => IUserDto[]
const toUserDtos: ToUserDtos = (users) => {
  return users.map(toUserDto)
}

export { toUserDto, toUserDtos }
