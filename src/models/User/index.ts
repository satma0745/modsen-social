import { model } from 'mongoose'

import { userSchema, IUserSchema, IUserModel } from './userSchema'
import { IProfileSchema } from './profileSchema'

const User = model<IUserSchema, IUserModel>('User', userSchema)

export { User, IUserSchema as IUser, IProfileSchema as IProfile }
