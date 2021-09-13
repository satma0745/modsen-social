import { IUser } from '../../models'

interface IUserDto {
  id: string
  username: string
  headline: string
  likes: number
}

type ToUserDto = (_userDocument: IUser) => IUserDto

const toUserDto: ToUserDto = (userDocument) => {
  return {
    id: userDocument._id.toString(),
    username: userDocument.username,
    headline: userDocument.profile.headline,
    likes: userDocument.profile.likedBy.length,
  }
}

export { toUserDto }
