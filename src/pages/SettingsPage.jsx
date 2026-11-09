import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, KeyRound, LogOut, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiMessage } from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import { useTheme } from '@/lib/theme';
import { formatDate } from '@/lib/format';
import Button from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Badge, Card, CardHeader, ConfirmDialog, Segmented } from '@/components/ui/Controls';
import { Alert, PageLoader } from '@/components/ui/Feedback';
import PasswordInput from '@/components/ui/PasswordInput';

const LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];
const PROVIDERS = [
  { value: 'groq', label: 'Groq' },
  { value: 'gemini', label: 'Gemini' },
];
const KEY_HELP = {
  groq: { url: 'https://console.groq.com/keys', text: 'console.groq.com/keys', placeholder: 'gsk_…' },
  gemini: { url: 'https://aistudio.google.com/apikey', text: 'aistudio.google.com/apikey', placeholder: 'AIza…' },
};

const splitList = (s) =>
  String(s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

function ProfileForm({ profile }) {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [form, setForm] = useState({
    name: profile.name || '',
    experienceLevel: profile.experienceLevel || 'Beginner',
    yearsOfExperience: profile.yearsOfExperience ?? '',
    preferredStack: (profile.preferredStack || []).join(', '),
    targetCompanies: (profile.targetCompanies || []).join(', '),
  });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v && v.target ? v.target.value : v }));

  const save = useMutation({
    mutationFn: async () =>
      (
        await api.patch('/settings/profile', {
          name: form.name.trim(),
          experienceLevel: form.experienceLevel,
          yearsOfExperience: form.yearsOfExperience === '' ? null : Number(form.yearsOfExperience),
          preferredStack: splitList(form.preferredStack),
          targetCompanies: splitList(form.targetCompanies),
        })
      ).data.data.profile,
    onSuccess: (p) => {
      updateUser({ name: p.name, experienceLevel: p.experienceLevel });
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Profile saved.');
    },
    onError: (err) => toast.error(apiMessage(err)),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5"
    >
      <Field label="Name">{(p) => <Input {...p} value={form.name} onChange={set('name')} maxLength={80} autoComplete="name" required />}</Field>
      <Field label="Years of experience" optional>
        {(p) => <Input {...p} type="number" min={0} max={50} step={0.5} inputMode="decimal" value={form.yearsOfExperience} onChange={set('yearsOfExperience')} />}
      </Field>
      <div className="space-y-1.5 sm:col-span-2">
        <p className="text-sm font-medium">Experience level</p>
        <Segmented name="Experience level" options={LEVELS} value={form.experienceLevel} onChange={set('experienceLevel')} />
      </div>
      <Field label="Preferred stack" optional hint="Comma-separated, e.g. React, Node.js, MongoDB">
        {(p) => <Input {...p} value={form.preferredStack} onChange={set('preferredStack')} />}
      </Field>
      <Field label="Target companies" optional hint="Comma-separated">
        {(p) => <Input {...p} value={form.targetCompanies} onChange={set('targetCompanies')} />}
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" loading={save.isPending}>
          Save profile
        </Button>
      </div>
    </form>
  );
}

function AiKeys({ keys, limits }) {
  const qc = useQueryClient();
  const [provider, setProvider] = useState('groq');
  const [key, setKey] = useState('');
  const [toRemove, setToRemove] = useState(null);
  const help = KEY_HELP[provider];

  const add = useMutation({
    mutationFn: async () => (await api.post('/settings/ai-keys', { provider, key: key.trim() })).data,
    onSuccess: (res) => {
      setKey('');
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success(res.warning ? `Key saved. ${res.warning}` : 'Key verified and saved.');
    },
    onError: (err) => toast.error(apiMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/settings/ai-keys/${id}`),
    onSuccess: () => {
      setToRemove(null);
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Key removed.');
    },
    onError: (err) => toast.error(apiMessage(err)),
  });

  const countFor = (p) => keys.filter((k) => k.provider === p).length;
  const full = countFor(provider) >= limits.maxKeysPerProvider;

  return (
    <div className="p-4 sm:p-5">
      <p className="text-sm text-muted">
        Interviews use shared AI keys by default{limits.dailyInterviewLimit > 0 ? `, limited to ${limits.dailyInterviewLimit} interviews per 24 hours` : ''}. Add your own free Groq or Gemini key to
        remove that limit; your keys are tried first, and the shared keys are the fallback.
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-surface-2 p-3 text-xs text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
        Keys are checked with the provider, stored encrypted, used only for your interviews, and never shown again — only the last 4 characters.
      </div>

      {keys.length > 0 && (
        <ul className="mt-5 divide-y divide-line rounded-lg border border-line">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center gap-3 px-3 py-2.5">
              <KeyRound className="size-4 shrink-0 text-subtle" aria-hidden="true" />
              <Badge mono>{k.provider}</Badge>
              <span className="font-mono text-sm">{k.masked}</span>
              <span className="ml-auto hidden text-xs text-subtle sm:inline">added {formatDate(k.addedAt)}</span>
              <Button size="iconSm" variant="ghost" onClick={() => setToRemove(k)} aria-label={`Remove ${k.provider} key ending ${k.masked.slice(-4)}`}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (key.trim()) add.mutate();
        }}
      >
        <div className="max-w-xs">
          <Segmented name="Provider" options={PROVIDERS} value={provider} onChange={setProvider} />
        </div>
        <Field label={`${provider === 'groq' ? 'Groq' : 'Gemini'} API key`} hint={full ? `You already have ${limits.maxKeysPerProvider} ${provider} keys.` : undefined}>
          {(p) => (
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1">
                <PasswordInput {...p} value={key} onChange={(e) => setKey(e.target.value)} placeholder={help.placeholder} autoComplete="off" spellCheck={false} disabled={full} />
              </div>
              <Button type="submit" loading={add.isPending} disabled={!key.trim() || full}>
                {add.isPending ? 'Checking…' : 'Add key'}
              </Button>
            </div>
          )}
        </Field>
        <a href={help.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-xs text-accent-text underline-offset-4 hover:underline">
          Get a free key at {help.text} <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </form>

      <ConfirmDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={() => remove.mutate(toRemove.id)}
        loading={remove.isPending}
        tone="danger"
        title="Remove this key?"
        description={toRemove ? `${toRemove.provider} key ${toRemove.masked}. Interviews will fall back to the shared keys.` : ''}
        confirmLabel="Remove"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['settings'], queryFn: async () => (await api.get('/settings')).data.data });
  const { mode, setMode } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (isLoading) return <PageLoader label="Loading settings…" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="label-mono">Settings</p>
      <h1 className="mt-1.5 text-2xl font-semibold sm:text-[28px]">Your account</h1>

      {error && (
        <Alert tone="danger" className="mt-6">
          {apiMessage(error)}
        </Alert>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader kicker="Profile" title="About you" />
            <ProfileForm profile={data.profile} />
          </Card>

          <Card>
            <CardHeader
              kicker="AI"
              title="Your API keys"
              action={data.limits.usingOwnKeys ? <Badge tone="accent">Using your keys</Badge> : <Badge>Shared keys</Badge>}
            />
            <AiKeys keys={data.aiKeys} limits={data.limits} />
          </Card>

          <Card>
            <CardHeader kicker="Appearance" title="Theme" />
            <div className="max-w-sm p-4 sm:p-5">
              <Segmented
                name="Theme"
                options={[
                  { value: 'system', label: 'System' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
                value={mode}
                onChange={setMode}
              />
            </div>
          </Card>

          <Card>
            <CardHeader kicker="Account" title="Session" />
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="text-sm text-muted">
                Signed in as <span className="text-fg">{data.profile.email}</span>
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut className="size-4" /> Log out
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
