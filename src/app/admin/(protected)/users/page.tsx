import { getSession } from '@/server/auth';
import { redirect } from 'next/navigation';
import UsersPanel from '@/components/admin/UsersPanel';

export default async function UsersPage() {
  const user = await getSession();
  if (user?.role !== 'SUPERADMIN' && user?.role !== 'ADMIN') redirect('/admin');

  return <UsersPanel currentRole={user!.role} currentId={user!.id} />;
}
