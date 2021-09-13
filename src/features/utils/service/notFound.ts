interface INotFoundOperationResult {
  success: false
  notFound: string
}

type NotFound = (_message: string) => INotFoundOperationResult

const notFound: NotFound = (message) => ({
  success: false,
  notFound: message,
})

export { notFound, INotFoundOperationResult }
