import { redirect } from 'next/navigation';
import { getSession, SITE_SECTIONS } from '@/server/auth';
import ContentEditor from '@/components/admin/ContentEditor';

export default async function ContentPage() {
  const user = await getSession();
  if (!user) redirect('/admin/login');

  return (
    <ContentEditor
      userRole={user.role}
      userPermissions={user.permissions as Record<string, boolean>}
      sections={[...SITE_SECTIONS]}
    />
  );
}
