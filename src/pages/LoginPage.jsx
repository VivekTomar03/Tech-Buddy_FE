import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import PasswordInput from '@/components/ui/PasswordInput';
import { Alert } from '@/components/ui/Feedback';

const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => () => clearError(), [clearError]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (await login(email.trim(), password)) navigate(safeNext(params.get('next')), { replace: true });
  };

  return (
    <AuthLayout title="Log in" subtitle="Pick up where you left off.">
      {params.get('expired') && !error && (
        <Alert tone="info" className="mb-5">
          Your session expired. Please log in again.
        </Alert>
      )}
      {error && (
        <Alert tone="danger" className="mb-5">
          {error}
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Email">
          {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />}
        </Field>
        <Field label="Password">
          {(p) => <PasswordInput {...p} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />}
        </Field>
        <Button type="submit" className="w-full" loading={loading} disabled={!email || !password}>
          Log in
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        New here?{' '}
        <Link to="/signup" className="font-medium text-accent-text underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
