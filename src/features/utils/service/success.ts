interface ISuccessOperationResult {
  success: true
  payload?: any
}

type Success = (_value?: any) => ISuccessOperationResult

const success: Success = (value) => ({
  success: true,
  payload: value,
})

export { success, ISuccessOperationResult }
