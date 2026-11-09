import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Code2, RefreshCw, Sparkles, Target, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiMessage, apiStatus } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatDate, KIND_LABEL } from '@/lib/format';
import Button from '@/components/ui/Button';
import { Badge, Card, CardHeader } from '@/components/ui/Controls';
import { Alert, EmptyState, PageLoader } from '@/components/ui/Feedback';
import { BandLabel, SeverityMeter, StatTile } from '@/components/ui/Score';
import { band } from '@/lib/score';
import { Message } from '@/features/interview/Chat';
import RichText from '@/components/ui/RichText';

function List({ items, icon: Icon, iconClass, empty }) {
  if (!items || !items.length) return <p className="text-sm text-subtle">{empty}</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
          <Icon className={cn('mt-0.5 size-4 shrink-0', iconClass)} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function QuestionRow({ e, index }) {
  const score100 = e.score == null ? null : Math.round(e.score * 10);
  const b = band(score100);
  return (
    <li className="grid gap-1.5 px-4 py-3.5 sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem] sm:gap-3 sm:px-5">
      <span className="hidden pt-0.5 font-mono text-xs text-subtle sm:block">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="label-mono mb-1 normal-case">
          {[e.subject, KIND_LABEL[e.kind], e.difficulty, e.isFollowUp && 'follow-up'].filter(Boolean).join(' · ')}
        </p>
        <p className="text-sm">
          <RichText text={e.question} />
        </p>
        {e.note && <p className="mt-1 text-sm text-muted">{e.note}</p>}
        {(e.tests || e.complexity) && (
          <p className="mt-1 font-mono text-xs text-subtle">
            {e.tests && (e.tests.executed ? `${e.tests.passed}/${e.tests.total} tests · ${e.tests.language}` : `${e.tests.language} · not executed`)}
            {e.complexity && ` · ${e.complexity}`}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
        <span className={cn('text-sm font-semibold tabular-nums', b.text)}>{e.score == null ? '—' : `${Math.round(e.score)}/10`}</span>
        {e.verdict === 'skipped' ? <Badge>skipped</Badge> : <BandLabel score={score100} />}
      </div>
    </li>
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data: d, isLoading, error } = useQuery({
    queryKey: ['interview', id],
    queryFn: async () => (await api.get(`/interviews/${id}`)).data.data,
  });

  const retry = useMutation({
    mutationFn: async () => (await api.post(`/interviews/${id}/report/retry`)).data.data,
    onSuccess: (data) => {
      qc.setQueryData(['interview', id], data);
      toast.success('Feedback rewritten by the AI.');
    },
    onError: (err) => toast.error(apiMessage(err)),
  });

  if (isLoading) return <PageLoader label="Loading report…" />;
  if (error || !d) {
    return (
      <EmptyState title={apiStatus(error) === 404 ? 'Report not found' : "Couldn't load this report"} action={<Button to="/dashboard">Back to dashboard</Button>}>
        {apiStatus(error) === 404 ? 'It may have been deleted.' : apiMessage(error)}
      </EmptyState>
    );
  }
  if (d.status !== 'Completed') {
    return (
      <EmptyState title="This interview isn't finished yet" action={<Button to={`/interview/${id}`}>Continue interview</Button>}>
        The report is created when the interview ends.
      </EmptyState>
    );
  }

  const analysis = d.analysis || {};
  const coverage = d.coverage ?? analysis.coverage;
  const evaluations = d.evaluations || [];
  const coding = analysis.codingResults || [];
  const subjects = d.subjectBreakdown || analysis.subjectBreakdown || [];
  const practiceAgain = `/setup?${new URLSearchParams({ company: d.companyName || '', topics: (d.topics || []).join(','), level: d.experienceLevel || '', duration: String(d.durationMinutes || 30) })}`;
  const hero = band(d.score);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="label-mono">Interview report</p>
          <h1 className="mt-1.5 text-2xl font-semibold sm:text-[28px]">{d.companyName}</h1>
          <p className="mt-1 text-sm text-muted">
            {formatDate(d.endedAt || d.createdAt)} · {d.experienceLevel} · {d.durationMinutes || 30} min · {(d.topics || []).join(', ')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button to="/dashboard" variant="secondary">
            Dashboard
          </Button>
          <Button to={practiceAgain}>
            Practise again <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      {d.unreliable && (
        <Alert tone="warn" title="Placeholder scores" className="mt-6">
          This report was made by an older version of the app while the AI was unavailable, so the scores are placeholders. It is excluded from your dashboard stats.
        </Alert>
      )}

      {d.insufficientData ? (
        <Card className="mt-6">
          <EmptyState icon={Target} title="Not enough answers to score" action={<Button to={practiceAgain}>Start a new interview</Button>}>
            The interview ended before any question was answered, so there's nothing to grade. This interview isn't counted in your stats.
          </EmptyState>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <Card className="p-5 sm:p-6">
              <p className="text-[13px] text-muted">Overall score</p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-6xl leading-none font-semibold tracking-tight">{d.score ?? '—'}</p>
                <p className="pb-1.5 text-sm text-subtle">/ 100</p>
                <BandLabel score={d.score} className="ml-auto pb-1.5" />
              </div>
              <div className={cn('mt-4 h-2 overflow-hidden rounded-full', hero.track)}>
                <div className={cn('h-full rounded-full', hero.fill)} style={{ width: `${d.score || 0}%` }} />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge tone={d.recommendation === 'Incomplete Interview' ? 'neutral' : d.score >= 70 ? 'accent' : d.score >= 45 ? 'warn' : 'danger'} className="text-xs">
                  {d.recommendation || '—'}
                </Badge>
                {coverage != null && (
                  <span className="text-xs text-subtle">
                    Based on {coverage}% of the planned questions
                    {analysis.answeredQuestions != null && ` (${analysis.answeredQuestions} of ${analysis.plannedQuestions})`}
                  </span>
                )}
              </div>
              {analysis.summary && <p className="mt-4 text-sm leading-relaxed text-muted">{analysis.summary}</p>}
            </Card>

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                ['Technical', d.technicalScore],
                ['Problem solving', d.problemSolvingScore],
                ['Communication', d.communicationScore],
              ].map(([label, value]) => (
                <StatTile key={label} label={label} value={value} suffix="/100" sub={<BandLabel score={value} />} />
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="By subject" kicker="Breakdown" />
              <div className="space-y-4 p-4 sm:p-5">
                {subjects.length ? (
                  subjects.map((s) => (
                    <SeverityMeter
                      key={s.subject}
                      label={s.subject}
                      score={s.covered === false ? null : s.score}
                      detail={s.questions != null ? `${s.questions} question${s.questions === 1 ? '' : 's'}` : null}
                    />
                  ))
                ) : (
                  <p className="text-sm text-subtle">No subject data.</p>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Coding" kicker="Tests run in your browser" />
              <div className="p-4 sm:p-5">
                {coding.length ? (
                  <ul className="space-y-3">
                    {coding.map((c) => (
                      <li key={c.problemId} className="flex items-start gap-3">
                        <Code2 className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{c.title}</p>
                          <p className="font-mono text-xs text-subtle">
                            {c.difficulty} · {c.language}
                            {c.complexity && ` · ${c.complexity}`}
                          </p>
                        </div>
                        <span className={cn('text-sm font-semibold tabular-nums', c.executed ? (c.passed === c.total ? 'text-accent-text' : 'text-warn') : 'text-subtle')}>
                          {c.executed ? `${c.passed}/${c.total}` : 'not run'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-subtle">No code was submitted in this interview.</p>
                )}
              </div>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader
              title="Feedback"
              kicker={d.narrativeSource === 'rules' ? 'Written from your scores' : 'Written by the AI from your answers'}
              action={
                d.narrativeSource === 'rules' && (
                  <Button size="sm" variant="secondary" onClick={() => retry.mutate()} loading={retry.isPending}>
                    {!retry.isPending && <RefreshCw className="size-3.5" />} Rewrite with AI
                  </Button>
                )
              }
            />
            <div className="grid gap-6 p-4 sm:p-5 md:grid-cols-3">
              <div>
                <p className="mb-3 text-sm font-semibold">Strengths</p>
                <List items={d.strongAreas} icon={CheckCircle2} iconClass="text-accent-text" empty="No clear strengths yet — that's what practice is for." />
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold">Weak areas</p>
                <List items={d.weakAreas} icon={TrendingDown} iconClass="text-danger" empty="No weak areas identified." />
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold">What to do next</p>
                <List items={d.improvementPlan} icon={Sparkles} iconClass="text-info" empty="—" />
              </div>
            </div>
            {d.narrativeSource === 'rules' && (
              <p className="border-t border-line px-4 py-3 text-xs text-subtle sm:px-5">
                The AI was busy when this report was made, so the feedback text was generated from your scores and notes. The scores themselves are unaffected.
              </p>
            )}
          </Card>
        </>
      )}

      {evaluations.length > 0 && (
        <Card className="mt-4">
          <details>
            <summary className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
              <span className="text-[15px] font-semibold">Question by question</span>
              <span className="text-sm text-subtle">{evaluations.length} answers</span>
            </summary>
            <ol className="divide-y divide-line border-t border-line">
              {evaluations.map((e, i) => (
                <QuestionRow key={i} e={e} index={i} />
              ))}
            </ol>
          </details>
        </Card>
      )}

      <Card className="mt-4">
        <details>
          <summary className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
            <span className="text-[15px] font-semibold">Full transcript</span>
            <span className="text-sm text-subtle">{(d.transcript || []).length} messages</span>
          </summary>
          <div className="flex flex-col gap-5 border-t border-line px-4 py-5 sm:px-5">
            {(d.transcript || []).map((entry, i) => (
              <Message key={entry._id || i} entry={entry} />
            ))}
          </div>
        </details>
      </Card>
    </div>
  );
}
