import { useEffect, useState } from 'react';

/**
 * Reliable wrapper around the Web Speech API (Chrome / Edge).
 *
 * Why the old mic "stopped in the middle":
 *  - Chrome ends a recognition session after a pause in speech or ~60s, even with continuous=true.
 *    The old code restarted instantly inside onend; when that threw, the error was swallowed
 *    and the mic stayed dead while the UI still said "Listening".
 *  - Any error other than "no-speech" (e.g. "network", common in Chrome) switched the mic off.
 *  - Words still in the interim buffer when a session ended were lost.
 *
 * Here every session gets a fresh recognizer, restarts use backoff, transient errors are
 * recoverable, interim text is committed before a restart, and listening can be paused
 * while the interviewer speaks.
 */

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const FATAL = {
  'not-allowed': 'Microphone access is blocked. Allow it from the address bar, then press the mic again.',
  'service-not-allowed': 'Speech recognition is disabled in this browser.',
  'audio-capture': 'No microphone was found. Connect one and press the mic again.',
  'language-not-supported': 'This speech language is not supported by your browser.',
};

const join = (a, b) =>
  [a, b]
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(' ');

/** Plain controller object; React state setters are passed in. Created once per component. */
function createController(set) {
  let rec = null;
  let wanted = false;
  let paused = false;
  let text = '';
  let interim = '';
  let lang = 'en-IN';
  let timer = null;
  let fails = { count: 0, since: 0 };

  const commitInterim = () => {
    if (interim.trim()) {
      text = join(text, interim);
      set.text(text);
    }
    interim = '';
    set.interim('');
  };

  const detach = (method) => {
    const r = rec;
    rec = null;
    if (!r) return;
    r.onresult = r.onerror = r.onend = r.onstart = r.onspeechstart = r.onspeechend = null;
    try {
      r[method]();
    } catch {
      /* already stopped */
    }
  };

  const scheduleRestart = () => {
    const now = Date.now();
    fails = now - fails.since > 15000 ? { count: 1, since: now } : { count: fails.count + 1, since: fails.since };
    if (fails.count > 8) {
      wanted = false;
      set.error('The microphone keeps disconnecting. Check your connection and press the mic to try again.');
      set.status('error');
      return;
    }
    if (fails.count > 2) set.status('reconnecting');
    const delay = Math.min(250 * 2 ** (fails.count - 1), 4000);
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (wanted && !paused) open();
    }, delay);
  };

  function open() {
    clearTimeout(timer);
    detach('abort');
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = lang;
    r.maxAlternatives = 1;

    r.onstart = () => set.status('listening');
    r.onspeechstart = () => set.hearing(true);
    r.onspeechend = () => set.hearing(false);
    r.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalChunk += res[0].transcript;
        else interimChunk += res[0].transcript;
      }
      if (finalChunk) {
        text = join(text, finalChunk);
        set.text(text);
      }
      interim = interimChunk;
      set.interim(interimChunk);
      fails = { count: 0, since: 0 };
    };
    r.onerror = (event) => {
      if (FATAL[event.error]) {
        wanted = false;
        set.error(FATAL[event.error]);
        set.status('error');
      } else if (event.error === 'network') {
        set.status('reconnecting');
      }
      // 'no-speech' / 'aborted' are normal: onend restarts.
    };
    r.onend = () => {
      set.hearing(false);
      commitInterim();
      if (rec !== r) return; // replaced or stopped on purpose
      rec = null;
      if (wanted && !paused) scheduleRestart();
      else if (!wanted) set.status((s) => (s === 'error' ? s : 'idle'));
    };

    rec = r;
    // Show feedback immediately; the browser may first ask for microphone permission.
    set.status((s) => (s === 'listening' || s === 'reconnecting' ? s : 'starting'));
    try {
      r.start();
    } catch {
      rec = null;
      scheduleRestart();
    }
  }

  return {
    setLang: (value) => {
      lang = value;
    },
    isWanted: () => wanted,
    /** Current dictated text, read synchronously (state may lag one render). */
    getText: () => text,
    start(initialText) {
      if (!SR) {
        set.error('Speech input needs Chrome or Edge.');
        set.status('error');
        return;
      }
      if (typeof initialText === 'string') {
        text = initialText;
        set.text(text);
      }
      set.error(null);
      wanted = true;
      paused = false;
      fails = { count: 0, since: 0 };
      open();
    },
    stop() {
      wanted = false;
      paused = false;
      clearTimeout(timer);
      detach('stop');
      commitInterim();
      set.hearing(false);
      set.status((s) => (s === 'error' ? s : 'idle'));
    },
    /** Stop listening for a moment (e.g. while the interviewer speaks). */
    pause() {
      if (!wanted) return;
      paused = true;
      clearTimeout(timer);
      detach('stop');
      commitInterim();
      set.status('paused');
    },
    resume() {
      if (!wanted || !paused) return;
      paused = false;
      open();
    },
    /** Replace the dictated text (after the user edits it or sends it). */
    reset(value = '') {
      text = value;
      interim = '';
      set.text(value);
      set.interim('');
    },
    destroy() {
      wanted = false;
      clearTimeout(timer);
      detach('abort');
    },
  };
}

export function useSpeechRecognition({ lang = 'en-IN' } = {}) {
  const [status, setStatus] = useState('idle'); // idle | starting | listening | paused | reconnecting | error
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const [hearing, setHearing] = useState(false);
  const [ctl] = useState(() => createController({ status: setStatus, text: setText, interim: setInterim, error: setError, hearing: setHearing }));

  useEffect(() => ctl.setLang(lang), [ctl, lang]);
  useEffect(() => () => ctl.destroy(), [ctl]);

  return {
    supported: !!SR,
    status,
    active: status === 'starting' || status === 'listening' || status === 'reconnecting' || status === 'paused',
    hearing,
    text,
    interim,
    error,
    isWanted: ctl.isWanted,
    getText: ctl.getText,
    start: ctl.start,
    stop: ctl.stop,
    pause: ctl.pause,
    resume: ctl.resume,
    reset: ctl.reset,
  };
}
