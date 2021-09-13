import { Types } from 'mongoose'

import { User } from '../../../models'
import { INotFoundOperationResult, ISuccessOperationResult, notFound, success } from '../../utils/service'

type GetFavorites = (_userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>

const getFavorites: GetFavorites = async (userId) => {
  const user = await User.findById(userId)
  if (user === null) {
    return notFound('User with provided id does not exist.')
  }

  const favorites = await User.find({ _id: { $in: user.profile.liked } })
  return success(favorites)
}

export default getFavorites
