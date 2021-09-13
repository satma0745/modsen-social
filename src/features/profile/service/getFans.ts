import { Types } from 'mongoose'

import { User } from '../../../models'
import { INotFoundOperationResult, ISuccessOperationResult, notFound, success } from '../../utils/service'

type GetFans = (_userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>

const getFans: GetFans = async (userId) => {
  const user = await User.findById(userId)
  if (user === null) {
    return notFound('User with provided id does not exist.')
  }

  const fans = await User.find({ _id: { $in: user.profile.likedBy } })
  return success(fans)
}

export default getFans
