import { model } from 'mongoose'

import { userSchema, IUserSchema } from './userSchema'
import { IProfileSchema } from './profileSchema'

const User = model('User', userSchema)

export { User, IUserSchema as IUser, IProfileSchema as IProfile }
