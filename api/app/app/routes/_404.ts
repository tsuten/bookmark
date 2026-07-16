import type { NotFoundHandler } from 'hono'

const handler: NotFoundHandler = (c) => {
  return c.json({ error: 'Not Found' }, 404)
}

export default handler
