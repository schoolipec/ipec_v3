import messages from '../../../messages/admin/en.json';

export default function AdminSkeletonPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-bold">{messages.Skeleton.title}</h1>
      <p className="text-slate-400">{messages.Skeleton.subtitle}</p>
    </main>
  );
}
