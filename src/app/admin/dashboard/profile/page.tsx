import { getSession } from '@/server/auth';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/admin/ProfileForm';

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Mi perfil</h1>
        <p className="mt-1 text-sm text-slate-400">Actualiza tus datos y preferencias.</p>
      </div>
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          adminLocale: user.adminLocale,
          notifyTelegram: user.notifyTelegram,
          notifyEmail: user.notifyEmail,
        }}
      />
    </div>
  );
}
