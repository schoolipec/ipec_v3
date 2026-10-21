import { getSession } from '@/server/auth';
import { prisma } from '@/server/db';
import DashboardHome from '@/components/admin/DashboardHome';

export default async function AdminDashboardPage() {
  const user = await getSession();
  const [prayerCount, userCount] = await Promise.all([
    prisma.prayerRequest.count(),
    prisma.user.count(),
  ]);

  return (
    <DashboardHome
      userName={user!.name}
      userRole={user!.role}
      userEmail={user!.email}
      prayerCount={prayerCount}
      userCount={userCount}
    />
  );
}
