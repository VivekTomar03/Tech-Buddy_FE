import { ArrowRight, CheckCircle2, ChevronDown, Code2, KeyRound, Mic, Gauge, MessagesSquare, TrendingUp, XCircle } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Controls';
import { SeverityMeter } from '@/components/ui/Score';
import { LogoMark } from '@/components/layout/Logo';
import Logo from '@/components/layout/Logo';

/* ─────────────── hero preview: the actual interview UI, composed statically ─────────────── */

function PreviewMessage({ meta, children }) {
  return (
    <div className="flex gap-2.5">
      <LogoMark className="mt-0.5 size-6 shrink-0" />
      <div className="min-w-0">
        <p className="label-mono mb-0.5 text-[10px] normal-case">{meta}</p>
        <p className="text-[13px] leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function HeroPreview() {
  return (
    <div
      role="img"
      aria-label="Preview of an interview: the interviewer asks about React keys, follows up on the candidate's answer, and a coding problem shows 5 of 6 tests passing."
      className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_60px_-30px_rgb(0_0_0/0.45)]"
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="text-[13px] font-semibold">Razorpay</span>
        <span className="truncate text-xs text-subtle">React · JavaScript · DSA</span>
        <span className="ml-auto rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">23:41</span>
      </div>
      <div className="grid sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-4 p-4">
          <PreviewMessage meta="react · easy">Why do list items in React need a key prop?</PreviewMessage>
          <div className="ml-auto max-w-[85%] rounded-lg bg-surface-3 px-3 py-2 text-[13px] leading-relaxed">So React knows which items changed between renders.</div>
          <PreviewMessage meta="react · follow-up">Right. What breaks if you use the array index as the key and then sort the list?</PreviewMessage>
          <div className="flex items-center gap-1.5 font-mono text-xs text-subtle">
            you're typing<span className="inline-block h-3.5 w-1.5 animate-blink bg-subtle" />
          </div>
        </div>
        <div className="border-t border-line bg-surface-2/60 sm:border-t-0 sm:border-l">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            <Code2 className="size-3.5 text-subtle" aria-hidden="true" />
            <span className="text-xs font-medium">Two Sum</span>
            <Badge tone="accent">easy</Badge>
            <span className="ml-auto font-mono text-[10px] text-subtle">python</span>
          </div>
          <pre className="overflow-hidden px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-muted">
            <span className="text-info">def</span> <span className="text-fg">two_sum</span>(nums, target):{'\n'}
            {'    '}seen = {'{}'}{'\n'}
            {'    '}<span className="text-info">for</span> i, n <span className="text-info">in</span> enumerate(nums):{'\n'}
            {'        '}<span className="text-info">if</span> target - n <span className="text-info">in</span> seen:{'\n'}
            {'            '}<span className="text-info">return</span> [seen[target - n], i]{'\n'}
            {'        '}seen[n] = i
          </pre>
          <div className="border-t border-line px-3 py-2 font-mono text-[11px]">
            <p className="mb-1 flex items-center gap-1.5 font-sans text-xs font-semibold">
              <XCircle className="size-3.5 text-warn" aria-hidden="true" /> 5/6 passed
            </p>
            <p className="text-subtle">
              <span className="text-accent-text">pass</span> ([2,7,11,15], 9)
            </p>
            <p className="text-subtle">
              <span className="text-danger">fail</span> ([3,3], 6) expected [0,1]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── content ─────────────── */

const STEPS = [
  { n: '01', title: 'It plans the interview', body: 'Pick a company, your level and up to six topics. The interviewer drafts questions at three difficulty levels and books time for a coding round.' },
  { n: '02', title: 'It asks — and follows up', body: 'One question at a time. Vague answers get “how does that work?”. Wrong ones get a simpler angle. Two follow-ups at most, then it moves on.' },
  { n: '03', title: 'You code against real tests', body: 'Coding problems open an editor. Your solution runs against the examples and hidden test cases right in your browser.' },
  { n: '04', title: 'You get an honest report', body: 'Each answer is scored 0–10 with a note. The report is calculated from those scores and your test results — nothing is filled in.' },
];

const FEATURES = [
  { icon: MessagesSquare, title: 'Follow-ups that dig', body: 'The interviewer reads your answer and probes the gaps — the part of a real interview a question bank can’t simulate.' },
  { icon: TrendingUp, title: 'Difficulty that moves with you', body: 'Each topic starts easy (medium if you’re advanced). Strong answers step you up, a rough patch steps you down.' },
  { icon: Code2, title: 'Code that actually runs', body: 'JavaScript, TypeScript and Python run against test cases in your browser. Java and C++ are reviewed by the interviewer.' },
  { icon: Mic, title: 'Voice, if you want it', body: 'Have questions read aloud and dictate your answers, to practise saying it — not just typing it. Chrome and Edge.' },
  { icon: Gauge, title: 'Scores you can trust', body: 'If the AI is unavailable, you’re told to retry. It never invents a question or a score to fill the gap.' },
  { icon: KeyRound, title: 'Free, with your own key if you like', body: 'Use the shared keys with a daily limit, or add your own free Groq or Gemini key in Settings for unlimited practice.' },
];

const FAQ = [
  { q: 'Is it free?', a: 'Yes. Interviews on the shared AI keys are limited per day. Adding your own free Groq or Gemini API key in Settings removes the limit.' },
  { q: 'Is my code sent to a server to run?', a: 'No. JavaScript, TypeScript and Python run inside your browser in an isolated worker. Only the code and the test results are sent to the interviewer for review.' },
  { q: 'Where do the scores come from?', a: 'The AI scores each answer from 0 to 10 and writes a short note. The report numbers are weighted averages of those scores (harder questions count more) plus your real test results.' },
  { q: 'Which browsers support voice?', a: 'Speech input works in Chrome and Edge. Everything else works in any modern browser.' },
  { q: 'Can I stop halfway?', a: 'Yes. End the interview any time; the report covers what you answered and shows how much of the plan was covered.' },
];

export default function LandingPage() {
  const { user } = useAuthStore();
  const primary = user ? { to: '/setup', label: 'Start an interview' } : { to: '/signup', label: 'Start practising — free' };

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12 lg:pt-20 lg:pb-24">
        <div>
          <p className="label-mono">Mock technical interviews</p>
          <h1 className="mt-4 text-[34px] leading-[1.08] font-semibold tracking-[-0.025em] sm:text-5xl xl:text-[54px]">
            Practise the interview,
            <br />
            not the quiz.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-[17px]">
            An AI interviewer that plans questions for your topics, follows up when your answer is vague, runs your code against real test cases, and scores you from what you
            actually said.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to={primary.to} size="lg">
              {primary.label} <ArrowRight className="size-4" />
            </Button>
            <a href="#how" className="inline-flex h-12 items-center justify-center rounded-lg border border-line px-5 text-[15px] text-fg hover:bg-surface-2">
              How it works
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {['No credit card', 'Code runs in your browser', 'Ends on time'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-accent-text" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <HeroPreview />
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-16 border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="label-mono">How an interview runs</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl">The structure of a real interview, run by the server — not left to chance.</h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-surface p-5 sm:p-6">
                <span className="font-mono text-sm text-accent-text">{s.n}</span>
                <h3 className="mt-3 text-[17px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="label-mono">What's different</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Built around the moments that decide interviews.</h2>
            <p className="mt-4 text-muted">Most practice tools check whether you know an answer. Interviews test whether you can explain it, defend it, and code it under a clock.</p>
          </div>
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <f.icon className="size-5 text-accent-text" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Example report */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="label-mono">At the end</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">A report that tells you what to fix next.</h2>
            <p className="mt-4 text-muted">
              Scores by subject, your coding results, the specific concepts you got right and wrong, and a short plan. Every question is listed with its score and the interviewer’s
              note.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-bg p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="label-mono">Example report</p>
              <Badge tone="accent">Startup Ready</Badge>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <p className="text-5xl leading-none font-semibold tracking-tight">64</p>
              <p className="pb-1 text-sm text-subtle">/ 100 · based on 100% of the plan</p>
            </div>
            <div className="mt-6 space-y-4">
              <SeverityMeter label="React" score={78} />
              <SeverityMeter label="JavaScript" score={61} />
              <SeverityMeter label="DSA" score={42} />
            </div>
            <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
              <p className="flex gap-2">
                <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" /> Missed the duplicate-values edge case in Two Sum.
              </p>
              <p className="flex gap-2">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" /> Before submitting, test empty input, duplicates and negatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="label-mono">Questions</p>
        <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Before you start</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex items-center justify-between gap-4 py-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="size-4 shrink-0 text-subtle transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="flex flex-col items-start gap-6 rounded-xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Your next interview is closer than it feels.</h2>
            <p className="mt-1.5 text-sm text-muted">Set one up in under two minutes.</p>
          </div>
          <Button to={primary.to} size="lg" className="w-full sm:w-auto">
            {primary.label} <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} TechBuddy</p>
        </div>
      </footer>
    </div>
  );
}
