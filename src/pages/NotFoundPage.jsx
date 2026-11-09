import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-start justify-center px-4">
      <p className="label-mono">404</p>
      <h1 className="mt-2 text-2xl font-semibold">This page doesn't exist.</h1>
      <p className="mt-2 text-sm text-muted">The link may be old, or the interview was deleted.</p>
      <div className="mt-6 flex gap-2">
        <Button to="/dashboard">Go to dashboard</Button>
        <Button to="/" variant="secondary">
          Home
        </Button>
      </div>
    </div>
  );
}
