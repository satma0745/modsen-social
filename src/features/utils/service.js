const success = (value) => ({
  success: true,
  payload: value,
})

const conflict = (message) => ({
  success: false,
  conflict: message,
})

const validationError = (errors) => ({
  success: false,
  validationErrors: errors,
})

const accessViolation = () => ({
  success: false,
  accessViolation: true,
})

const notFound = (message) => ({
  success: false,
  notFound: message ?? true,
})

module.exports = { success, conflict, validationError, accessViolation, notFound }
