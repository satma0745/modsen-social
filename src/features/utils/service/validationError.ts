interface IValidationErrorOperationResult {
  success: false
  validationErrors: object
}

type ValidationError = (_errors: object) => IValidationErrorOperationResult

const validationError: ValidationError = (errors) => ({
  success: false,
  validationErrors: errors,
})

export { validationError, IValidationErrorOperationResult }
