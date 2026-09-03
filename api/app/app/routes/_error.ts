import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ApiError, toErrorResponse } from '../lib/errors'

const handler: ErrorHandler = (e, c) => {
  if (e instanceof ApiError) {
    return c.json(toErrorResponse(e), e.status as ContentfulStatusCode)
  }
  if ('getResponse' in e) {
    return e.getResponse()
  }
  console.error(e)
  return c.json({ error: 'Internal Server Error' }, 500)
}

export default handler
