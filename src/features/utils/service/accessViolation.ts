interface IAccessViolationOperationResult {
  success: false
  accessViolation: true
}

type AccessViolation = () => IAccessViolationOperationResult

const accessViolation: AccessViolation = () => ({
  success: false,
  accessViolation: true,
})

export { accessViolation, IAccessViolationOperationResult }
