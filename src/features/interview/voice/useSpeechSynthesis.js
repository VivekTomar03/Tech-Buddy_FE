import { useEffect, useState } from 'react';

/**
 * Text-to-speech for the interviewer.
 * Long text is split into sentence-sized chunks: Chrome silently stops speaking a single
 * utterance after ~15 seconds, which cut questions off mid-sentence.
 */

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

/** Strip things that sound bad when read aloud (code ticks, markdown, symbols). */
export function speakable(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' (code) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function chunk(text, max = 180) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const out = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > max && cur) {
      out.push(cur.trim());
      cur = '';
    }
    if (s.length > max) {
      for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max).trim());
    } else cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

function pickVoice(lang) {
  const voices = synth ? synth.getVoices() : [];
  const base = lang.split('-')[0];
  const score = (v) =>
    (v.lang === lang ? 4 : v.lang.startsWith(base) ? 2 : 0) + (/natural|neural|google|online/i.test(v.name) ? 1 : 0) + (v.localService ? 0 : 0.5);
  return voices.filter((v) => v.lang.startsWith(base)).sort((a, b) => score(b) - score(a))[0] || null;
}

function createSpeaker(setSpeaking) {
  let token = 0;
  return {
    speak(text, { lang = 'en-IN', rate = 1, onEnd } = {}) {
      if (!synth) {
        if (onEnd) onEnd();
        return;
      }
      synth.cancel();
      const my = ++token;
      const parts = chunk(speakable(text));
      const voice = pickVoice(lang);
      let i = 0;
      setSpeaking(true);
      const next = () => {
        if (my !== token) return; // cancelled or replaced
        if (i >= parts.length) {
          setSpeaking(false);
          if (onEnd) onEnd();
          return;
        }
        const u = new SpeechSynthesisUtterance(parts[i++]);
        if (voice) u.voice = voice;
        u.lang = voice ? voice.lang : lang;
        u.rate = rate;
        u.onend = next;
        u.onerror = next;
        synth.speak(u);
      };
      next();
    },
    cancel() {
      token++;
      if (synth) synth.cancel();
      setSpeaking(false);
    },
  };
}

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [speaker] = useState(() => createSpeaker(setSpeaking));

  useEffect(() => {
    // Voices load asynchronously in Chrome.
    if (synth) synth.getVoices();
    return () => speaker.cancel();
  }, [speaker]);

  return { supported: !!synth, speaking, speak: speaker.speak, cancel: speaker.cancel };
}
