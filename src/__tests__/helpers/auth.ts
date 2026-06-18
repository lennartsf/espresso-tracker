import { beforeEach } from 'vitest'
import { setCurrentUserId } from '../../lib/auth'

export const TEST_UID = 'test-user-0000'

/** Call at module top in any test that needs a logged-in user. */
export function useTestUser() {
  beforeEach(() => setCurrentUserId(TEST_UID))
}
