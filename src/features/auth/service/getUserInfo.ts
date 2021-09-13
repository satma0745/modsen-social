import { Types } from 'mongoose'

import { User } from '../../../models'
import { ISuccessOperationResult, success } from '../../utils/service'

type GetUserInfo = (_userId: Types.ObjectId) => Promise<ISuccessOperationResult>

const getUserInfo: GetUserInfo = async (userId) => {
  const user = await User.findById(userId)
  return success(user)
}

export default getUserInfo
