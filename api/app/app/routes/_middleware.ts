import { createRoute } from 'honox/factory'
import { connectDB } from '../lib/db/connect'

export default createRoute(async (c, next) => {
  if (!c.env.MONGODB_URI) {
    return c.json(
      { error: 'configuration-error', message: 'MONGODB_URI is not configured' },
      503,
    )
  }
  await connectDB(c.env.MONGODB_URI)
  return next()
})
