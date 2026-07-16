import type { ErrorHandler } from 'hono'

const handler: ErrorHandler = (e, c) => {
  if ('getResponse' in e) {
    return e.getResponse()
  }
  console.error(e)
  return c.json({ error: 'Internal Server Error' }, 500)
}

export default handler
