interface IUnauthorizedOperationResultDetails {
  access?: boolean
  refresh?: boolean
}

interface IUnauthorizedOperationResult {
  success: false
  unauthorized: IUnauthorizedOperationResultDetails
}

type Unauthorized = (_details: IUnauthorizedOperationResultDetails) => IUnauthorizedOperationResult

const unauthorized: Unauthorized = ({ access, refresh }) => ({
  success: false,
  unauthorized: { access, refresh },
})

export { unauthorized, IUnauthorizedOperationResult }
