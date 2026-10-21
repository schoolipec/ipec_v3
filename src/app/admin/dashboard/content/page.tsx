import { getSession, SITE_SECTIONS } from '@/server/auth';
import { redirect } from 'next/navigation';
import ContentEditor from '@/components/admin/ContentEditor';

export default async function ContentPage() {
  const user = await getSession();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Contenido del sitio</h1>
        <p className="mt-1 text-sm text-slate-400">
          Guardar publica de inmediato. Cada cambio queda en el historial.
        </p>
      </div>
      <ContentEditor userRole={user.role} userPermissions={user.permissions as Record<string, boolean>} sections={[...SITE_SECTIONS]} />
    </div>
  );
}
