import { isValidObjectId, Types } from 'mongoose'

type ObjectIdValidator = (value: any) => true | never
type ValidObjectId = (errorMessage: string) => ObjectIdValidator

const validObjectId: ValidObjectId = (errorMessage) => {
  return (value) => {
    if (!isValidObjectId(value)) {
      throw new Error(errorMessage)
    }

    return true
  }
}

type ObjectIdSanitizer = (value: any) => Types.ObjectId | null

const toObjectId: ObjectIdSanitizer = (value) => {
  return isValidObjectId(value) ? new Types.ObjectId(value) : null
}

type OfTypeValidator = (value: any) => true | never
type OfType = (allowedTypes: string[], errorMessage: string) => OfTypeValidator

const ofType: OfType = (allowedTypes, errorMessage) => {
  return (value) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const allowedType of allowedTypes) {
      // eslint-disable-next-line valid-typeof
      if (typeof value === allowedType) {
        return true
      }
    }

    throw new Error(errorMessage)
  }
}

export { validObjectId, toObjectId, ofType }
