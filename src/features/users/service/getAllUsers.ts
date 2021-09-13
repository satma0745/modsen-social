import { User } from '../../../models'
import { ISuccessOperationResult, success } from '../../utils/service'

type GetAllUsers = () => Promise<ISuccessOperationResult>

const getAllUsers: GetAllUsers = async () => {
  const users = await User.find({})
  return success(users)
}

export default getAllUsers
