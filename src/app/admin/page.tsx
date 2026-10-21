import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth';

export default async function AdminIndex() {
  const user = await getSession();
  redirect(user ? '/admin/dashboard' : '/admin/login');
}
