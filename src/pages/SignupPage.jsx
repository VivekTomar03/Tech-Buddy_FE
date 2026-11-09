import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import PasswordInput from '@/components/ui/PasswordInput';
import { Segmented } from '@/components/ui/Controls';
import { Alert } from '@/components/ui/Feedback';

const LEVELS = [
  { value: 'Beginner', label: 'Beginner', hint: '0-2y' },
  { value: 'Intermediate', label: 'Intermediate', hint: '2-5y' },
  { value: 'Advanced', label: 'Advanced', hint: '5y+' },
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', experienceLevel: 'Beginner' });
  const [touched, setTouched] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => () => clearError(), [clearError]);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e && e.target ? e.target.value : e }));

  const errors = {
    name: !form.name.trim() ? 'Enter your name.' : '',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) ? 'Enter a valid email.' : '',
    password: form.password.length < 6 ? 'Use at least 6 characters.' : '',
  };
  const valid = !errors.name && !errors.email && !errors.password;

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    if (await register({ ...form, name: form.name.trim(), email: form.email.trim() })) navigate('/setup', { replace: true });
  };

  return (
    <AuthLayout title="Create your account" subtitle="Free. Your first interview takes about two minutes to set up.">
      {error && (
        <Alert tone="danger" className="mb-5">
          {error}
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Name" error={touched && errors.name}>
          {(p) => <Input {...p} autoComplete="name" value={form.name} onChange={set('name')} autoFocus />}
        </Field>
        <Field label="Email" error={touched && errors.email}>
          {(p) => <Input {...p} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} />}
        </Field>
        <Field label="Password" hint="At least 6 characters." error={touched && errors.password}>
          {(p) => <PasswordInput {...p} autoComplete="new-password" value={form.password} onChange={set('password')} />}
        </Field>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Experience</p>
          <Segmented name="Experience level" options={LEVELS} value={form.experienceLevel} onChange={set('experienceLevel')} />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent-text underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
