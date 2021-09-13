import { Types } from 'mongoose'

import { User } from '../../../models'
import { INotFoundOperationResult, ISuccessOperationResult, notFound, success } from '../../utils/service'

type GetSingleUser = (_userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>

const getSingleUser: GetSingleUser = async (userId) => {
  const user = await User.findById(userId)
  if (user === null) {
    return notFound('User with provided id does not exist.')
  }

  return success(user)
}

export default getSingleUser
