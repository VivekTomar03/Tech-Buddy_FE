import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock, Code2, MessageSquare, Network } from 'lucide-react';
import api, { apiCode, apiMessage } from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import { classifyTopic, KIND_LABEL, pluralize } from '@/lib/format';
import Button from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Card, CardHeader, Segmented, Switch } from '@/components/ui/Controls';
import { Alert } from '@/components/ui/Feedback';
import TopicPicker from '@/components/TopicPicker';
import { MAX_TOPICS } from '@/lib/topics';

const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Razorpay', 'Swiggy', 'Zomato', 'Atlassian', 'TCS', 'Infosys', 'Accenture', 'Early-stage startup'];
const LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];
const DURATIONS = [
  { value: 15, label: '15', hint: 'min' },
  { value: 30, label: '30', hint: 'min' },
  { value: 45, label: '45', hint: 'min' },
  { value: 60, label: '60', hint: 'min' },
];
const KIND_ICON = { theory: MessageSquare, coding: Code2, system_design: Network, machine_coding: Code2 };

const speechSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

/** Mirrors the backend's time budget so the preview matches what will be planned. */
function previewPlan(topics, duration, includeCoding) {
  const kinds = topics.map((t) => ({ name: t, kind: classifyTopic(t) }));
  const theory = kinds.filter((k) => k.kind === 'theory').length;
  const hasDSA = kinds.some((k) => k.kind === 'coding');
  const coding = hasDSA ? (duration >= 30 ? 2 : 1) : includeCoding ? 1 : 0;
  const design = kinds.filter((k) => k.kind === 'system_design').length;
  const machine = kinds.filter((k) => k.kind === 'machine_coding').length;
  const reserved = 2 + coding * 12 + design * 10 + machine * 12;
  const perTopic = theory ? Math.min(4, Math.max(2, Math.round((duration - reserved) / 3 / theory))) : 0;
  const items = [];
  let codingShown = false;
  for (const k of kinds) {
    if (k.kind === 'theory') items.push({ ...k, detail: `${perTopic} questions + follow-ups` });
    else if (k.kind === 'system_design') items.push({ ...k, detail: '1 design problem' });
    else if (k.kind === 'machine_coding') items.push({ ...k, detail: '1 build task' });
    else if (!codingShown) {
      codingShown = true;
      items.push({ ...k, detail: pluralize(coding, 'problem') + ' with tests' });
    }
  }
  if (!hasDSA && coding) items.push({ name: 'Coding round', kind: 'coding', detail: '1 problem with tests' });
  return items;
}

export default function SetupPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState(() => ({
    companyName: params.get('company') || '',
    topics: (params.get('topics') || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, MAX_TOPICS),
    experienceLevel: params.get('level') || (user && user.experienceLevel) || 'Beginner',
    duration: Number(params.get('duration')) || 30,
    includeCoding: true,
    voiceInterview: false,
    candidateName: (user && user.name) || '',
  }));
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v && v.target ? v.target.value : v }));
  const plan = useMemo(() => previewPlan(form.topics, form.duration, form.includeCoding), [form.topics, form.duration, form.includeCoding]);

  const errors = {
    companyName: !form.companyName.trim() ? 'Add the company you are preparing for.' : '',
    topics: !form.topics.length ? 'Pick at least one topic.' : '',
  };

  const start = async (e) => {
    e && e.preventDefault();
    setTouched(true);
    if (errors.companyName || errors.topics) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/interviews', { ...form, companyName: form.companyName.trim() });
      navigate(`/interview/${data.data._id}`);
    } catch (err) {
      setError({ code: apiCode(err), message: apiMessage(err, 'Could not start the interview.') });
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="label-mono">New interview</p>
      <h1 className="mt-1.5 text-2xl font-semibold sm:text-[28px]">Set up your mock interview</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted">The interviewer plans questions for these topics, asks follow-ups based on your answers, and adjusts difficulty as you go.</p>

      <form onSubmit={start} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" noValidate>
        <div className="space-y-6">
          <Card>
            <CardHeader kicker="01" title="Role" />
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <Field label="Target company" error={touched && errors.companyName} hint="Questions are pitched at this company's style.">
                {(p) => <Input {...p} list="company-suggestions" value={form.companyName} onChange={set('companyName')} placeholder="e.g. Razorpay" maxLength={80} />}
              </Field>
              <datalist id="company-suggestions">
                {COMPANIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <Field label="Your name" optional hint="Used by the interviewer to greet you.">
                {(p) => <Input {...p} value={form.candidateName} onChange={set('candidateName')} maxLength={60} autoComplete="name" />}
              </Field>
              <div className="space-y-1.5 sm:col-span-2">
                <p className="text-sm font-medium">Experience level</p>
                <Segmented name="Experience level" options={LEVELS} value={form.experienceLevel} onChange={set('experienceLevel')} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader kicker="02" title="Topics" />
            <div className="p-4 sm:p-5">
              <TopicPicker value={form.topics} onChange={set('topics')} error={touched && errors.topics} />
            </div>
          </Card>

          <Card>
            <CardHeader kicker="03" title="Format" />
            <div className="space-y-5 p-4 sm:p-5">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Duration</p>
                <Segmented name="Duration in minutes" options={DURATIONS} value={form.duration} onChange={set('duration')} />
              </div>
              <Switch
                id="coding"
                checked={form.includeCoding}
                onChange={set('includeCoding')}
                label="Include a coding round"
                description="Adds one coding problem when DSA isn't a topic. Your code runs against test cases in the browser (JavaScript, TypeScript, Python)."
              />
              <Switch
                id="voice"
                checked={form.voiceInterview && speechSupported}
                onChange={set('voiceInterview')}
                disabled={!speechSupported}
                label="Voice mode"
                description={
                  speechSupported
                    ? 'The interviewer reads questions aloud and listens after speaking. You can switch it off any time during the interview.'
                    : "Your browser doesn't support speech input. Use Chrome or Edge for voice mode."
                }
              />
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader kicker="Preview" title="What you'll get" />
            <div className="p-4 sm:p-5">
              {plan.length ? (
                <ol className="space-y-3">
                  {plan.map((item, i) => {
                    const Icon = KIND_ICON[item.kind];
                    return (
                      <li key={item.name + i} className="flex gap-3">
                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-subtle">
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-subtle">
                            {KIND_LABEL[item.kind]} · {item.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-sm text-subtle">Pick topics to see the plan.</p>
              )}
              <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-sm text-muted">
                <Clock className="size-4 text-subtle" aria-hidden="true" />
                About {form.duration} minutes · ends on time or when the plan is done
              </div>

              {error && (
                <Alert tone={error.code === 'AI_UNAVAILABLE' ? 'warn' : 'danger'} className="mt-4">
                  {error.message}
                  {error.code === 'DAILY_LIMIT' && (
                    <>
                      {' '}
                      <Link to="/settings" className="font-medium text-accent-text underline underline-offset-4">
                        Add your own key
                      </Link>
                    </>
                  )}
                </Alert>
              )}

              <Button type="submit" size="lg" className="mt-5 w-full" loading={submitting}>
                {submitting ? 'Planning your interview…' : error && error.code === 'AI_UNAVAILABLE' ? 'Try again' : 'Start interview'}
                {!submitting && <ArrowRight className="size-4" />}
              </Button>
              <p className="mt-3 text-center text-xs text-subtle">You can end early any time; the report covers what you answered.</p>
            </div>
          </Card>
        </aside>
      </form>
    </div>
  );
}
