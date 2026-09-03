import type { ProfileRecord } from './types'

export type ProfileRepository = {
  ensure(
    userId: string,
    input: { displayName: string },
  ): Promise<{ profile: ProfileRecord; created: boolean }>
  get(userId: string): Promise<ProfileRecord | null>
  update(userId: string, input: { displayName: string }): Promise<ProfileRecord | null>
  delete(userId: string): Promise<boolean>
}
