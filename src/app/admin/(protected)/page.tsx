import DashboardHome from '@/components/admin/DashboardHome';
import { getVisitStats } from '@/server/analytics';

export default async function AdminDashboardPage() {
  const stats = await getVisitStats(30);
  return <DashboardHome stats={stats} />;
}
