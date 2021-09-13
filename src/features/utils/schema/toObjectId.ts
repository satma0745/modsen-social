import { isValidObjectId, Types } from 'mongoose'

type ObjectIdSanitizer = (_value: string) => Types.ObjectId | null

const toObjectId: ObjectIdSanitizer = (value) => {
  return isValidObjectId(value) ? new Types.ObjectId(value) : null
}

export default toObjectId
