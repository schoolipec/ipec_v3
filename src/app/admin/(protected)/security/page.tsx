import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth';
import SecurityPanel from '@/components/admin/SecurityPanel';

export default async function SecurityPage() {
  const user = await getSession();
  if (!user) redirect('/admin/login');

  return (
    <SecurityPanel
      twoFactorEnabled={user.twoFactorEnabled}
      sessionTimeout={user.sessionTimeout}
    />
  );
}
