import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Code2, ListChecks, MessageSquare, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import api, { apiCode, apiMessage, apiStatus } from '@/lib/api';
import { cn } from '@/lib/cn';
import Button from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Controls';
import { Alert, EmptyState, PageLoader } from '@/components/ui/Feedback';
import { MessageList } from '@/features/interview/Chat';
import Composer from '@/features/interview/Composer';
import ProgressRail, { Timer } from '@/features/interview/ProgressRail';
import { useCountdown } from '@/features/interview/useCountdown';
import CodePanel from '@/features/interview/CodePanel';
import { useSpeechRecognition } from '@/features/interview/voice/useSpeechRecognition';
import { useSpeechSynthesis } from '@/features/interview/voice/useSpeechSynthesis';

const local = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};

/** Text of the current machine-coding task, taken from the interviewer's message. */
function currentTask(transcript) {
  const entry = [...(transcript || [])].reverse().find((e) => e.role === 'interviewer' && e.meta && e.meta.kind === 'machine_coding' && !e.meta.followUp);
  if (!entry) return { text: '', key: 'task' };
  const m = entry.content.match(/Here's the task: ([\s\S]*?) Build it in the editor/);
  return { text: m ? m[1] : entry.content, key: entry.meta.questionId || 'task' };
}

function questionKeyOf(data) {
  const cur = data && data.progress && data.progress.current;
  if (!cur || !cur.openEditor) return null;
  return cur.problemId || currentTask(data.transcript).key;
}

export default function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const queryKey = ['interview', id];
  const { data: interview, isLoading, error: loadError } = useQuery({
    queryKey,
    queryFn: async () => (await api.get(`/interviews/${id}`)).data.data,
  });

  const [draft, setDraftState] = useState('');
  const draftRef = useRef('');
  const setDraft = (v) => {
    draftRef.current = v;
    setDraftState(v);
  };
  const [pending, setPending] = useState(null);
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState(null);
  const [tab, setTab] = useState('chat');
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  const [speechLang, setSpeechLangState] = useState(() => local.get('tb-speech-lang') || 'en-IN');
  const [voicePref, setVoicePref] = useState(() => {
    const v = local.get(`tb-voice:${id}`);
    return v == null ? null : v === '1';
  });

  const stt = useSpeechRecognition({ lang: speechLang });
  const tts = useSpeechSynthesis();
  const voiceMode = (voicePref ?? !!(interview && interview.voiceInterview)) && tts.supported;
  const voiceModeRef = useRef(voiceMode);
  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  const progress = interview && interview.progress;
  const editorOpen = !!(progress && progress.current && progress.current.openEditor);
  const qKey = questionKeyOf(interview);
  const task = useMemo(() => (interview ? currentTask(interview.transcript) : { text: '', key: 'task' }), [interview]);
  const secondsLeft = useCountdown(progress && progress.endsAt);
  const lastEntry = interview && interview.transcript && interview.transcript[interview.transcript.length - 1];

  // Read new interviewer messages aloud in voice mode, then open the mic (hands-free).
  const spokenRef = useRef(null);
  useEffect(() => {
    if (!lastEntry || lastEntry.role !== 'interviewer' || !voiceMode) return;
    if (spokenRef.current === lastEntry._id) return;
    spokenRef.current = lastEntry._id;
    if (stt.isWanted()) stt.pause();
    tts.speak(lastEntry.content, {
      lang: speechLang,
      onEnd: () => {
        if (!voiceModeRef.current) return;
        if (stt.isWanted()) stt.resume();
        else if (stt.supported) stt.start(draftRef.current);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEntry && lastEntry._id, voiceMode]);

  if (isLoading) return <PageLoader label="Loading interview…" />;
  if (loadError || !interview) {
    return (
      <EmptyState
        className="min-h-dvh"
        title={apiStatus(loadError) === 404 ? 'Interview not found' : "Couldn't load this interview"}
        action={<Button to="/dashboard">Back to dashboard</Button>}
      >
        {apiStatus(loadError) === 404 ? 'It may have been deleted.' : apiMessage(loadError)}
      </EmptyState>
    );
  }
  if (interview.status === 'Completed') return <Navigate to={`/report/${id}`} replace />;

  const composerValue = stt.status === 'idle' ? draft : stt.text;

  async function submit(payload, { optimistic, restore, kind }) {
    if (sending) return false;
    setSending(true);
    setBanner(null);
    tts.cancel();
    setPending(optimistic ? { _id: 'pending', pending: true, ...optimistic } : null);
    try {
      const { data } = await api.post(`/interviews/${id}/answer`, payload);
      setPending(null);
      qc.setQueryData(queryKey, data.data);
      if (data.isEnded) {
        stt.stop();
        qc.invalidateQueries({ queryKey: ['stats'] });
        qc.invalidateQueries({ queryKey: ['interviews'] });
        toast.success('Interview complete — here is your report.');
        navigate(`/report/${id}`, { replace: true });
        return true;
      }
      const nextKey = questionKeyOf(data.data);
      if (nextKey && nextKey !== qKey) setTab('code');
      else if (kind === 'code') setTab('chat');
      return true;
    } catch (err) {
      setPending(null);
      if (restore) {
        setDraft(restore);
        stt.reset(restore);
      }
      const code = apiCode(err);
      if (code === 'COMPLETED') {
        navigate(`/report/${id}`, { replace: true });
        return false;
      }
      if (code === 'BUSY') {
        toast.message('Your previous answer is still being processed…');
        qc.invalidateQueries({ queryKey });
        return false;
      }
      setBanner({
        tone: code === 'AI_UNAVAILABLE' ? 'warn' : 'danger',
        message: apiMessage(err),
        retryAfter: err.response && err.response.data && err.response.data.retryAfter,
        kind,
        payload,
        optimistic,
      });
      return false;
    } finally {
      setSending(false);
    }
  }

  function sendText() {
    let text = composerValue;
    if (stt.status !== 'idle') {
      stt.stop(); // commits words still being recognised
      text = stt.getText ? stt.getText() : stt.text;
    }
    text = String(text || '').trim();
    if (!text) return;
    stt.reset('');
    setDraft('');
    submit({ answer: text }, { optimistic: { role: 'candidate', content: text }, restore: text, kind: 'text' });
  }

  const submitCode = (p) =>
    submit(p, {
      kind: 'code',
      optimistic: { role: 'candidate', content: '', meta: { kind: 'code', language: p.language, tests: p.tests ? { executed: true, passed: p.tests.passed, total: p.tests.total } : undefined } },
    });

  function toggleMic() {
    if (stt.status === 'idle' || stt.status === 'error') {
      tts.cancel();
      stt.start(composerValue);
    } else {
      stt.stop();
      const t = stt.getText ? stt.getText() : stt.text;
      setDraft(t);
    }
  }

  function onComposerChange(value) {
    setDraft(value);
    if (stt.status !== 'idle') stt.reset(value);
  }

  function toggleVoiceMode() {
    const next = !voiceMode;
    setVoicePref(next);
    local.set(`tb-voice:${id}`, next ? '1' : '0');
    if (!next) tts.cancel();
    else spokenRef.current = null; // read the current question now
  }

  async function endNow() {
    setEnding(true);
    stt.stop();
    tts.cancel();
    try {
      await api.post(`/interviews/${id}/end`);
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['interviews'] });
      navigate(`/report/${id}`, { replace: true });
    } catch (err) {
      toast.error(apiMessage(err, 'Could not end the interview.'));
      setEnding(false);
      setConfirmEnd(false);
    }
  }

  const entries = pending ? [...interview.transcript, pending] : interview.transcript;
  const view = tab === 'code' && !editorOpen ? 'chat' : tab;

  const voice = {
    supported: stt.supported,
    status: stt.status,
    interim: stt.interim,
    hearing: stt.hearing,
    error: stt.error,
    toggle: toggleMic,
  };

  const footer = (
    <>
      {banner && (
        <Alert
          tone={banner.tone}
          title={banner.tone === 'warn' ? 'The interviewer is busy' : 'That did not go through'}
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => (banner.kind === 'text' ? sendText() : submit(banner.payload, { kind: banner.kind, optimistic: banner.optimistic }))}
              disabled={sending}
            >
              <RotateCw className="size-3.5" /> Retry
            </Button>
          }
        >
          {banner.message}
          {banner.retryAfter ? ` Suggested wait: ${banner.retryAfter}s.` : ''}
        </Alert>
      )}
      {secondsLeft === 0 && <Alert tone="info">Time's up. Your next answer will be the last one, or end the interview now.</Alert>}
    </>
  );

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-line px-2 sm:gap-2 sm:px-4">
        <Button variant="ghost" size="icon" to="/dashboard" aria-label="Back to dashboard">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{interview.companyName}</p>
          <p className="truncate text-xs text-subtle">{(interview.topics || []).join(' · ')}</p>
        </div>
        <Timer endsAt={progress && progress.endsAt} />
        {tts.supported && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoiceMode}
            aria-pressed={voiceMode}
            aria-label={voiceMode ? 'Voice mode on: questions are read aloud and the mic opens after. Click to turn off.' : 'Voice mode off. Click to have questions read aloud.'}
            title={voiceMode ? 'Voice mode on' : 'Voice mode off'}
            className={cn(voiceMode && 'text-accent-text')}
          >
            {voiceMode ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={() => setConfirmEnd(true)}>
          End
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            'w-72 shrink-0 border-r border-line bg-surface',
            // While coding, the rail gives its width to the chat until the screen is very wide.
            view === 'progress' ? (editorOpen ? 'block w-full lg:hidden 2xl:block 2xl:w-72' : 'block w-full lg:w-72') : editorOpen ? 'hidden 2xl:block' : 'hidden lg:block'
          )}
        >
          <ProgressRail
            progress={progress}
            company={interview.companyName}
            level={interview.experienceLevel}
            speechLang={speechLang}
            voiceSupported={stt.supported}
            onSpeechLang={(v) => {
              setSpeechLangState(v);
              local.set('tb-speech-lang', v);
            }}
          />
        </aside>

        <section className={cn('min-w-0 flex-1 flex-col', view === 'chat' ? 'flex' : 'hidden lg:flex')} aria-label="Conversation">
          <MessageList entries={entries} thinking={sending} footer={footer} />
          <Composer
            value={composerValue}
            onChange={onComposerChange}
            onSend={sendText}
            sending={sending}
            disabled={ending}
            voice={voice}
            placeholder={editorOpen ? 'Discuss your approach…' : 'Type your answer…'}
          />
        </section>

        {editorOpen && (
          <section className={cn('min-w-0 flex-col border-l border-line lg:flex lg:w-[52%] lg:max-w-[880px]', view === 'code' ? 'flex flex-1 lg:flex-none' : 'hidden')} aria-label="Code editor">
            <CodePanel
              key={qKey}
              interviewId={id}
              questionKey={qKey}
              problem={progress.problem}
              taskText={progress.problem ? '' : task.text}
              disabled={sending || ending}
              onSubmit={submitCode}
            />
          </section>
        )}
      </div>

      <nav className="grid shrink-0 grid-cols-3 border-t border-line bg-surface pb-safe lg:hidden" aria-label="Interview panels">
        {[
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'code', label: 'Code', icon: Code2, disabled: !editorOpen },
          { id: 'progress', label: 'Progress', icon: ListChecks },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            disabled={t.disabled}
            aria-current={view === t.id ? 'page' : undefined}
            className={cn('relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] disabled:opacity-40', view === t.id ? 'text-fg' : 'text-subtle')}
          >
            <t.icon className="size-5" aria-hidden="true" />
            {t.label}
            {t.id === 'code' && editorOpen && view !== 'code' && <span className="absolute top-2.5 right-[calc(50%-18px)] size-2 rounded-full bg-accent" aria-label="Editor available" />}
            {view === t.id && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-fg" aria-hidden="true" />}
          </button>
        ))}
      </nav>

      <ConfirmDialog
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        onConfirm={endNow}
        loading={ending}
        title="End the interview now?"
        description={`Your report will cover the ${progress ? progress.answered : 0} question(s) you answered. Unanswered parts of the plan count as not covered.`}
        confirmLabel="End and see report"
      />
    </div>
  );
}
