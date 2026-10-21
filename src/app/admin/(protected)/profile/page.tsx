import { getSession } from '@/server/auth';
import ProfileForm from '@/components/admin/ProfileForm';

export default async function ProfilePage() {
  const user = await getSession();

  return (
    <ProfileForm
      initial={{
        name: user!.name,
        email: user!.email,
        adminLocale: user!.adminLocale,
        notifyTelegram: user!.notifyTelegram,
        notifyEmail: user!.notifyEmail,
      }}
    />
  );
}
