import { IProfile, IUser } from '../../models'

interface IProfileDto {
  headline: string
  bio: string
  likes: number
  contacts: { type: string; value: string }[]
}
type ToProfileDto = (_profile: IProfile) => IProfileDto
const toProfileDto: ToProfileDto = (profileModel) => ({
  headline: profileModel.headline,
  bio: profileModel.bio,
  likes: profileModel.likedBy.length,
  contacts: profileModel.contacts.map(({ type, value }) => ({ type, value })),
})

interface IUserDto {
  id: string
  username: string
  headline: string
  likes: number
}
type ToUserDto = (_user: IUser) => IUserDto
const toUserDto: ToUserDto = (userModel) => ({
  id: userModel._id.toString(),
  username: userModel.username,
  headline: userModel.profile.headline,
  likes: userModel.profile.likedBy.length,
})

type ToUserDtos = (_users: IUser[]) => IUserDto[]
const toUserDtos: ToUserDtos = (users) => {
  return users.map(toUserDto)
}

export { toProfileDto, toUserDtos }
