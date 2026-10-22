import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth';
import MailsPanel from '@/components/admin/MailsPanel';

export default async function MailsPage() {
  const user = await getSession();
  if (user?.role !== 'SUPERADMIN' && user?.role !== 'ADMIN') redirect('/admin');
  return <MailsPanel />;
}
