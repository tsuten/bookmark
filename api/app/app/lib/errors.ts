export class ApiError extends Error {
  constructor(
    public code: string,
    message?: string,
    public status = 400,
  ) {
    super(message ?? code)
  }
}

export function toErrorResponse(error: ApiError) {
  return {
    error: error.code,
    message: error.message,
  } as const
}
