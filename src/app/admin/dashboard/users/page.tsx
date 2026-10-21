import { getSession } from '@/server/auth';
import { redirect } from 'next/navigation';
import UsersPanel from '@/components/admin/UsersPanel';

export default async function UsersPage() {
  const user = await getSession();
  if (!user) redirect('/admin/login');
  if (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') redirect('/admin/dashboard');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-400">Gestiona usuarios e invitaciones.</p>
      </div>
      <UsersPanel currentRole={user.role} />
    </div>
  );
}
