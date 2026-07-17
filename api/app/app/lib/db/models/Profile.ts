import type { Model } from 'mongoose'

type ProfileDoc = {
  userId: string
  displayName: string
  createdAt: Date
  updatedAt: Date
}

let profileModel: Model<ProfileDoc> | null = null

export async function getProfileModel() {
  if (profileModel) {
    return profileModel
  }

  const { default: mongoose } = await import('mongoose')
  const schema = new mongoose.Schema<ProfileDoc>(
    {
      userId: { type: String, required: true, unique: true, index: true },
      displayName: { type: String, default: '', trim: true },
      createdAt: { type: Date, required: true },
      updatedAt: { type: Date, required: true },
    },
    {
      collection: 'profiles',
    },
  )

  profileModel =
    (mongoose.models.Profile as Model<ProfileDoc> | undefined) ??
    mongoose.model<ProfileDoc>('Profile', schema)

  return profileModel
}

export type { ProfileDoc }
