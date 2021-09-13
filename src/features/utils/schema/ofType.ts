type OfTypeValidator = (_value: string) => true | never
type OfType = (_allowedTypes: string[], _errorMessage: string) => OfTypeValidator

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

export default ofType
