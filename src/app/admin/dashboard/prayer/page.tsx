import { getSession } from '@/server/auth';
import { redirect } from 'next/navigation';
import PrayerTable from '@/components/admin/PrayerTable';

export default async function PrayerPage() {
  const user = await getSession();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Pedidos de oración</h1>
        <p className="mt-1 text-sm text-slate-400">Los más recientes primero.</p>
      </div>
      <PrayerTable />
    </div>
  );
}
