type MongooseModule = typeof import('mongoose')

type MongooseCache = {
  conn: MongooseModule['default'] | null
  promise: Promise<MongooseModule['default']> | null
}

const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache
}

const cached: MongooseCache = globalForMongoose.mongoose ?? { conn: null, promise: null }
globalForMongoose.mongoose = cached

export async function connectDB(uri: string): Promise<MongooseModule['default']> {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = import('mongoose')
      .then(({ default: mongoose }) =>
        mongoose.connect(uri, { bufferCommands: false }).then(() => mongoose),
      )
      .catch((error) => {
        cached.promise = null
        throw error
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
