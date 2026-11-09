import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, BarChart3, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiMessage } from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import { relativeTime } from '@/lib/format';
import Button from '@/components/ui/Button';
import { Badge, Card, CardHeader, ConfirmDialog } from '@/components/ui/Controls';
import { Alert, EmptyState, Skeleton } from '@/components/ui/Feedback';
import { BandLabel, SeverityMeter, StatTile } from '@/components/ui/Score';

const TrendChart = lazy(() => import('@/features/dashboard/TrendChart'));

function statusBadge(i) {
  if (i.status === 'In Progress') return <Badge tone="warn">In progress</Badge>;
  if (i.unreliable) return <Badge>Placeholder</Badge>;
  if (i.insufficientData) return <Badge>No score</Badge>;
  return <Badge tone="accent">Completed</Badge>;
}

function scoreCell(i) {
  if (i.status !== 'Completed' || i.unreliable || i.insufficientData || i.score == null) return <span className="text-subtle">—</span>;
  return (
    <span className="inline-flex items-center justify-end gap-2">
      <BandLabel score={i.score} />
      <span className="w-7 font-semibold tabular-nums">{i.score}</span>
    </span>
  );
}

function InterviewActions({ i, onDelete }) {
  const done = i.status === 'Completed';
  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="sm" variant={done ? 'secondary' : 'primary'} to={done ? `/report/${i._id}` : `/interview/${i._id}`}>
        {done ? 'Report' : 'Continue'}
      </Button>
      <Button size="iconSm" variant="ghost" onClick={() => onDelete(i)} aria-label={`Delete ${i.companyName} interview`}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [toDelete, setToDelete] = useState(null);

  const stats = useQuery({ queryKey: ['stats'], queryFn: async () => (await api.get('/interviews/stats')).data.data, placeholderData: keepPreviousData });
  const list = useQuery({ queryKey: ['interviews'], queryFn: async () => (await api.get('/interviews')).data.data, placeholderData: keepPreviousData });

  const del = useMutation({
    mutationFn: (id) => api.delete(`/interviews/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Interview deleted.');
      setToDelete(null);
    },
    onError: (err) => toast.error(apiMessage(err)),
  });

  const s = stats.data;
  const interviews = list.data || [];
  const firstName = ((user && user.name) || '').split(' ')[0];
  const loading = stats.isLoading || list.isLoading;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-mono">Dashboard</p>
          <h1 className="mt-1.5 text-2xl font-semibold sm:text-[28px]">{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}</h1>
          <p className="mt-1 text-sm text-muted">Every number here comes from completed interviews and your actual answers.</p>
        </div>
        <Button to="/setup" size="lg" className="w-full sm:w-auto md:hidden">
          <Plus className="size-4" /> New interview
        </Button>
      </div>

      {(stats.error || list.error) && (
        <Alert tone="danger" className="mt-6" title="Couldn't load your dashboard">
          {apiMessage(stats.error || list.error)}
        </Alert>
      )}

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((k) => <Skeleton key={k} className="h-26 rounded-xl" />)
        ) : (
          <>
            <StatTile label="Completed interviews" value={s ? s.totals.completed : 0} sub={s && s.totals.inProgress ? `${s.totals.inProgress} in progress` : 'None in progress'} />
            <StatTile
              label="Average score"
              value={s && s.averages.overall}
              suffix="/100"
              sub={
                s && s.improvement != null ? (
                  <span className={s.improvement >= 0 ? 'text-accent-text' : 'text-danger'}>
                    {s.improvement >= 0 ? '+' : ''}
                    {s.improvement} since your first
                  </span>
                ) : (
                  'Needs 2 interviews for a trend'
                )
              }
            />
            <StatTile label="Hiring readiness" value={s && s.readiness ? s.readiness.label : null} valueClassName="text-lg leading-snug" sub={s && s.readiness ? `Average of last ${s.readiness.basedOn}: ${s.readiness.average}` : 'Unlocks after 2 scored interviews'} />
            <StatTile
              label="Strongest · weakest"
              value={s && s.strongest ? s.strongest.subject : null}
              valueClassName="truncate text-lg leading-snug"
              sub={s && s.weakest ? `Weakest: ${s.weakest.subject} (${s.weakest.average})` : s && s.strongest ? `${s.strongest.average} average` : 'Shown after your first report'}
            />
          </>
        )}
      </div>

      {s && s.totals.excluded > 0 && (
        <p className="mt-3 text-xs text-subtle">
          {s.totals.excluded} report{s.totals.excluded === 1 ? ' is' : 's are'} not counted: ended before any answer, or made by an older version while the AI was unavailable.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader kicker="Progress" title="Score over time" />
          <div className="p-4 sm:p-5">
            {loading ? (
              <Skeleton className="h-72" />
            ) : s && s.trend.length >= 2 ? (
              <Suspense fallback={<Skeleton className="h-72" />}>
                <TrendChart trend={s.trend} />
              </Suspense>
            ) : (
              <EmptyState icon={BarChart3} title={s && s.trend.length === 1 ? 'One interview so far' : 'No scored interviews yet'} action={<Button to="/setup">Start an interview</Button>}>
                {s && s.trend.length === 1 ? `Your first score was ${s.trend[0].overall}. Complete another to see how you're trending.` : 'Your trend appears after two completed interviews.'}
              </EmptyState>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader kicker="Subjects" title="Average by subject" />
          <div className="space-y-4 p-4 sm:p-5">
            {loading ? (
              [0, 1, 2].map((k) => <Skeleton key={k} className="h-9" />)
            ) : s && s.subjects.length ? (
              s.subjects.map((sub) => <SeverityMeter key={sub.subject} label={sub.subject} score={sub.average} detail={`${sub.interviews} interview${sub.interviews === 1 ? '' : 's'}`} />)
            ) : (
              <p className="py-6 text-center text-sm text-subtle">Subject scores appear after your first report.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader kicker="History" title="Interviews" action={interviews.length > 0 && <span className="text-sm text-subtle">{interviews.length}</span>} />
        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((k) => (
              <Skeleton key={k} className="h-12" />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No interviews yet" action={<Button to="/setup">Start your first interview <ArrowRight className="size-4" /></Button>}>
            Pick a company and a few topics — the interviewer takes it from there.
          </EmptyState>
        ) : (
          <>
            {/* table ≥ md */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-subtle">
                    <th className="px-5 py-2.5 font-medium">Company</th>
                    <th className="px-3 py-2.5 font-medium">Topics</th>
                    <th className="px-3 py-2.5 font-medium">When</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 text-right font-medium">Score</th>
                    <th className="px-5 py-2.5">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {interviews.map((i) => (
                    <tr key={i._id} className="hover:bg-surface-2/60">
                      <td className="px-5 py-3 font-medium">
                        <Link to={i.status === 'Completed' ? `/report/${i._id}` : `/interview/${i._id}`} className="hover:underline">
                          {i.companyName}
                        </Link>
                      </td>
                      <td className="max-w-65 truncate px-3 py-3 text-muted">{(i.topics || []).join(', ')}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-muted">{relativeTime(i.createdAt)}</td>
                      <td className="px-3 py-3">{statusBadge(i)}</td>
                      <td className="px-3 py-3 text-right">{scoreCell(i)}</td>
                      <td className="px-5 py-3">
                        <InterviewActions i={i} onDelete={setToDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* cards < md */}
            <ul className="divide-y divide-line md:hidden">
              {interviews.map((i) => (
                <li key={i._id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{i.companyName}</p>
                      {statusBadge(i)}
                    </div>
                    <p className="truncate text-sm text-muted">{(i.topics || []).join(', ')}</p>
                    <p className="mt-0.5 text-xs text-subtle">
                      {relativeTime(i.createdAt)}
                      {i.status === 'Completed' && i.score != null && !i.unreliable && (
                        <>
                          {' · '}
                          {scoreCell(i)}
                        </>
                      )}
                    </p>
                  </div>
                  <InterviewActions i={i} onDelete={setToDelete} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => del.mutate(toDelete._id)}
        loading={del.isPending}
        tone="danger"
        title="Delete this interview?"
        description={toDelete ? `${toDelete.companyName} — ${(toDelete.topics || []).join(', ')}. The transcript and report are removed permanently.` : ''}
        confirmLabel="Delete"
      />
    </div>
  );
}
