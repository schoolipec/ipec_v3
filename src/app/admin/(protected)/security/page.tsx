import { getSession } from '@/server/auth';
import SecurityPanel from '@/components/admin/SecurityPanel';

export default async function SecurityPage() {
  const user = await getSession();

  return (
    <SecurityPanel
      twoFactorEnabled={user!.twoFactorEnabled}
      sessionTimeout={user!.sessionTimeout}
    />
  );
}
