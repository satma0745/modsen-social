import { isValidObjectId } from 'mongoose'

type ObjectIdValidator = (_value: string) => true | never
type ValidObjectId = (_errorMessage: string) => ObjectIdValidator

const validObjectId: ValidObjectId = (errorMessage) => {
  return (value) => {
    if (!isValidObjectId(value)) {
      throw new Error(errorMessage)
    }

    return true
  }
}

export default validObjectId
