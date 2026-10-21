import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth';
import ProtectedShell from '@/components/admin/ProtectedShell';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/admin/login');

  return (
    <ProtectedShell
      name={user.name}
      email={user.email}
      role={user.role}
    >
      {children}
    </ProtectedShell>
  );
}
