import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <AdminTopbar name={user.name} email={user.email} role={user.role} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
