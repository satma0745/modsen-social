interface IConflictOperationResult {
  success: false
  conflict: string
}

type Conflict = (_message: string) => IConflictOperationResult

const conflict: Conflict = (message) => ({
  success: false,
  conflict: message,
})

export { conflict, IConflictOperationResult }
