import SettingsClient from '@/components/admin/SettingsClient'
import { requireUser } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { user } = await requireUser()
  return <SettingsClient email={user.email ?? ''} lastSignIn={user.last_sign_in_at ?? null} />
}
