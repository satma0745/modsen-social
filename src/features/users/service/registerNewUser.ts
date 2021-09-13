import { User } from '../../../models'
import { ISuccessOperationResult, IValidationErrorOperationResult, success, validationError } from '../../utils/service'

interface IUserCredentials {
  username: string
  password: string
}

type OperationResult = IValidationErrorOperationResult | ISuccessOperationResult

type RegisterNewUser = (_credentials: IUserCredentials) => Promise<OperationResult>

const registerNewUser: RegisterNewUser = async ({ username, password }) => {
  if (await User.existsWithUsername(username)) {
    return validationError({ username: 'Username already taken by someone else.' })
  }

  const user = new User({ username, password })
  await user.save()

  const userId = user._id.toString()
  return success(userId)
}

export default registerNewUser
