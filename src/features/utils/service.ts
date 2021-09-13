interface ISuccessOperationResult {
  success: true
  payload?: any
}
type Success = (value?: any) => ISuccessOperationResult

const success: Success = (value) => ({
  success: true,
  payload: value,
})

interface IConflictOperationResult {
  success: false
  conflict: string
}
type Conflict = (message: string) => IConflictOperationResult

const conflict: Conflict = (message) => ({
  success: false,
  conflict: message,
})

interface IValidationErrorOperationResult {
  success: false
  validationErrors: object
}
type ValidationError = (errors: object) => IValidationErrorOperationResult

const validationError: ValidationError = (errors) => ({
  success: false,
  validationErrors: errors,
})

interface IUnauthorizedOperationResultDetails {
  access?: boolean
  refresh?: boolean
}
interface IUnauthorizedOperationResult {
  success: false
  unauthorized: IUnauthorizedOperationResultDetails
}
type Unauthorized = (details: IUnauthorizedOperationResultDetails) => IUnauthorizedOperationResult

const unauthorized: Unauthorized = ({ access, refresh }) => ({
  success: false,
  unauthorized: { access, refresh },
})

interface IAccessViolationOperationResult {
  success: false
  accessViolation: true
}
type AccessViolation = () => IAccessViolationOperationResult

const accessViolation: AccessViolation = () => ({
  success: false,
  accessViolation: true,
})

interface INotFoundOperationResult {
  success: false
  notFound: string
}
type NotFound = (message: string) => INotFoundOperationResult

const notFound: NotFound = (message) => ({
  success: false,
  notFound: message,
})

export { success, conflict, validationError, unauthorized, accessViolation, notFound }
export {
  ISuccessOperationResult,
  IConflictOperationResult,
  IValidationErrorOperationResult,
  IUnauthorizedOperationResult,
  IAccessViolationOperationResult,
  INotFoundOperationResult,
}
