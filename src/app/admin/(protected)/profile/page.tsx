import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth';
import ProfileForm from '@/components/admin/ProfileForm';

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect('/admin/login');

  return (
    <ProfileForm
      initial={{
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
        whatsapp: user.whatsapp ?? '',
        telegramChatId: user.telegramChatId ?? '',
        notifyTelegram: user.notifyTelegram,
        notifyEmail: user.notifyEmail,
      }}
    />
  );
}
