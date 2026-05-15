import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  IconButton, Avatar, CircularProgress, Divider, Container
} from '@mui/material';
import { Send, Mic, MicOff, PhoneOff, Bot, MessageSquare, Code } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ─────────────────────────── helpers ─────────────────────────── */

const isCodingPhase = (aiResponse) => {
  if (!aiResponse) return false;
  if (aiResponse.openEditor === true) return true;
  const phase = (aiResponse.phase || '').toLowerCase();
  if (phase === 'dsa' || phase === 'machine_coding') return true;
  const subject = (aiResponse.subject || '').toLowerCase();
  if (subject.includes('dsa') || subject.includes('machine coding')) return true;
  const q = (aiResponse.question || '').toLowerCase();
  return (
    q.includes('write a function') ||
    q.includes('implement') ||
    q.includes('coding problem') ||
    q.includes('coding task') ||
    q.includes('solve this') ||
    q.includes('code this') ||
    q.includes('write code')
  );
};

/* ─────────────────────────── component ─────────────────────────── */

const LiveInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── core state ──────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // ── report / end state ──────────────────────────────────────────
  const [isEnded, setIsEnded] = useState(false);
  const [report, setReport] = useState(null);

  // ── input state ─────────────────────────────────────────────────
  const [input, setInput] = useState('');
  const [interimText, setInterimText] = useState('');

  // ── voice state ─────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const shouldRecordRef = useRef(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const interimRef = useRef('');            // ref mirror of interimText for use in handleSend closure

  // ── coding editor state ─────────────────────────────────────────
  const [showEditor, setShowEditor] = useState(false);
  const [code, setCode] = useState('// Write your solution here\n\nfunction solution() {\n  \n}\n\nconsole.log(solution());\n');
  const [consoleOutput, setConsoleOutput] = useState('');

  // ── refs ────────────────────────────────────────────────────────
  const chatEndRef = useRef(null);
  const inputRef = useRef('');  // mirror of input for use inside closures

  // keep refs in sync with state
  useEffect(() => { inputRef.current = input; }, [input]);
  useEffect(() => { interimRef.current = interimText; }, [interimText]);

  /* ── scroll to bottom ─────────────────────────────────────────── */
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  useEffect(scrollToBottom, [messages, scrollToBottom]);

  /* ── TTS ──────────────────────────────────────────────────────── */
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    // Pause mic while AI speaks
    if (shouldRecordRef.current) {
      recognitionRef.current?.stop();
    }
    utterance.onend = () => {
      if (shouldRecordRef.current) {
        try { recognitionRef.current?.start(); } catch (_) {}
      }
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  /* ── Speech Recognition setup ─────────────────────────────────── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let newFinal = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newFinal += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (newFinal) {
        finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + newFinal;
        setInput(finalTranscriptRef.current);
        interimRef.current = '';
        setInterimText('');
      } else {
        interimRef.current = interim;
        setInterimText(interim);
      }
    };

    recognition.onend = () => {
      if (shouldRecordRef.current) {
        try { recognition.start(); } catch (_) {}
      } else {
        setIsRecording(false);
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return; // ignore silently
      console.error('Speech error:', e.error);
      setIsRecording(false);
      shouldRecordRef.current = false;
    };

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.stop(); } catch (_) {}
    };
  }, []); // only once on mount

  /* ── fetch interview on mount ─────────────────────────────────── */
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        const data = res.data.data;
        setInterview(data);
        setMessages(data.transcript || []);

        if (data.status === 'Completed') {
          setReport(data.analysis);
          setIsEnded(true);
          return;
        }

        // Speak the last interviewer message and check if editor should open
        const lastMsg = [...(data.transcript || [])].reverse().find(m => m.role === 'interviewer');
        if (lastMsg) {
          speak(lastMsg.content);
          if (lastMsg.meta?.openEditor || isCodingPhase(lastMsg.meta)) {
            setShowEditor(true);
          }
        }
      } catch (err) {
        console.error('fetchInterview error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id, speak]);

  /* ── toggle mic ────────────────────────────────────────────────── */
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      shouldRecordRef.current = false;
      try { recognitionRef.current?.stop(); } catch (_) {}
      setIsRecording(false);
    } else {
      shouldRecordRef.current = true;
      finalTranscriptRef.current = inputRef.current; // preserve typed text
      setIsRecording(true);
      try { recognitionRef.current?.start(); } catch (_) {}
    }
  }, [isRecording]);

  /* ── send answer ───────────────────────────────────────────────── */
  const handleSend = useCallback(async (overrideText = null) => {
    // Use refs so this closure never captures stale state values
    const textToSend = typeof overrideText === 'string'
      ? overrideText
      : (inputRef.current + (interimRef.current ? ' ' + interimRef.current : '')).trim();

    if (!textToSend) return;

    // Stop mic immediately before any async work
    shouldRecordRef.current = false;
    try { recognitionRef.current?.stop(); } catch (_) {}
    setIsRecording(false);
    window.speechSynthesis?.cancel();

    // Clear all input fields
    finalTranscriptRef.current = '';
    interimRef.current = '';
    setInput('');
    setInterimText('');

    setMessages(prev => [...prev, { role: 'candidate', content: textToSend }]);
    setIsTyping(true);

    try {
      const res = await api.post(`/interviews/${id}/answer`, { answer: textToSend });

      if (res.data.isEnded) {
        setReport(res.data.report);
        setIsEnded(true);
        speak('The interview is now complete. I have generated your final evaluation report.');
        return;
      }

      const aiMsg = { role: 'interviewer', content: res.data.nextQuestion, meta: res.data.aiResponse };
      setMessages(prev => [...prev, aiMsg]);
      speak(res.data.nextQuestion);

      if (isCodingPhase(res.data.aiResponse)) {
        setShowEditor(true);
      }
    } catch (err) {
      console.error('submitAnswer error:', err);
      setMessages(prev => [...prev, { role: 'interviewer', content: "Sorry, I had a connection issue. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  }, [id, speak]);  // no interimText here — we read interimRef.current directly

  /* ── run code locally (JS only) ────────────────────────────────── */
  const handleRunCode = useCallback(() => {
    setConsoleOutput('Running...\n');
    const output = [];
    const original = console.log;
    console.log = (...args) => {
      output.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      original(...args);
    };
    try {
      // eslint-disable-next-line no-eval
      eval(code); // intentional — sandboxed to browser tab, no server impact
      console.log = original;
      setConsoleOutput(output.join('\n') || 'Executed successfully (no output).');
    } catch (err) {
      console.log = original;
      setConsoleOutput(`Error: ${err.message}`);
    }
  }, [code]);

  /* ── submit code as answer ─────────────────────────────────────── */
  const handleSubmitCode = useCallback(async () => {
    const submission = `[CODE SUBMISSION]\n\n${code}`;
    setConsoleOutput('Submitting to interviewer...');
    await handleSend(submission);
    setConsoleOutput('Code submitted. Awaiting feedback...');
  }, [code, handleSend]);

  /* ── end interview ─────────────────────────────────────────────── */
  const handleEnd = useCallback(async () => {
    if (!window.confirm('Are you sure you want to end this interview?')) return;

    // Stop everything immediately
    window.speechSynthesis?.cancel();
    shouldRecordRef.current = false;
    try { recognitionRef.current?.stop(); } catch (_) {}
    setIsRecording(false);

    // Show typing indicator while AI generates the report
    setIsTyping(true);

    try {
      const res = await api.post(`/interviews/${id}/end`);
      const reportData = res.data.report || res.data.data?.analysis;
      setReport(reportData);
      setIsEnded(true);
    } catch (err) {
      console.error('endInterview error:', err);
      // Never crash — show a fallback report
      setReport({
        overallScore: 0,
        communicationScore: 0,
        problemSolvingScore: 0,
        technicalScore: 0,
        strongAreas: [],
        weakAreas: ['Interview ended unexpectedly — please try again.'],
        improvementPlan: ['Restart the interview and try again.'],
        recommendation: 'Not Ready',
        subjectBreakdown: [],
      });
      setIsEnded(true);
    } finally {
      setIsTyping(false);
    }
  }, [id]);

  /* ────────────────────────── REPORT VIEW ────────────────────────── */
  // IMPORTANT: check isEnded BEFORE loading so the report is never hidden by a spinner
  if (isEnded && report) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper sx={{
          p: { xs: 3, md: 5 },
          borderRadius: '24px',
          bgcolor: 'rgba(30,41,59,0.7)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
        }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit', mb: 0.5 }}>
                Interview Report
              </Typography>
              <Typography sx={{ color: '#94a3b8' }}>
                {interview?.companyName} — {interview?.topics?.join(', ')}
              </Typography>
            </Box>
            <Box sx={{ px: 2.5, py: 1, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>
              {report.recommendation || 'Startup Ready'}
            </Box>
          </Box>

          <Divider sx={{ mb: 5, borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* Score cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
            {[
              { label: 'Overall', value: report.overallScore, color: '#6366f1' },
              { label: 'Communication', value: report.communicationScore, color: '#a855f7' },
              { label: 'Problem Solving', value: report.problemSolvingScore, color: '#ec4899' },
              { label: 'Technical Depth', value: report.technicalScore, color: '#10b981' },
            ].map((s) => (
              <Paper key={s.label} sx={{ p: 3, textAlign: 'center', borderRadius: '20px', bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                  <CircularProgress variant="determinate" value={s.value || 0} size={80} thickness={4} sx={{ color: s.color }} />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>{s.value || 0}%</Typography>
                  </Box>
                </Box>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>{s.label}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Subject breakdown */}
          {report.subjectBreakdown?.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Subject Breakdown</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {report.subjectBreakdown.map((s, i) => (
                  <Box key={i} sx={{ px: 2, py: 1, borderRadius: '10px', bgcolor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.subject}</Typography>
                    <Typography variant="caption" sx={{ color: '#6366f1' }}>{s.score}%</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Strengths / Weaknesses */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', mr: 1 }} />
                Strengths
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(report.strongAreas || []).map((item, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.9rem' }}>
                    {item}
                  </Box>
                ))}
                {(!report.strongAreas || report.strongAreas.length === 0) && (
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>No specific strengths recorded.</Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: '#ec4899', mr: 1 }} />
                Weak Areas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(report.weakAreas || []).map((item, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)', color: '#ec4899', fontSize: '0.9rem' }}>
                    {item}
                  </Box>
                ))}
                {(!report.weakAreas || report.weakAreas.length === 0) && (
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>No weak areas identified.</Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Improvement plan */}
          {report.improvementPlan?.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Improvement Roadmap</Typography>
              <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                {report.improvementPlan.map((step, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: i < report.improvementPlan.length - 1 ? 2 : 0 }}>
                    <Typography sx={{ color: '#6366f1', fontWeight: 800, minWidth: 24 }}>{i + 1}.</Typography>
                    <Typography sx={{ color: '#94a3b8' }}>{step}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ px: 6, py: 2, borderRadius: '16px', bgcolor: '#6366f1', fontWeight: 800, '&:hover': { bgcolor: '#4f46e5' } }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  /* ────────────────────────── LOADING ────────────────────────────── */
  if (loading) {
    return (
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  /* ────────────────────────── LIVE INTERVIEW ─────────────────────── */
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden', bgcolor: '#0f172a' }}>

      {/* ── Left sidebar ── */}
      <Box sx={{
        width: '280px', flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        p: 3, display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column', bgcolor: 'rgba(15,23,42,0.6)'
      }}>
        {/* AI Avatar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, mt: 2 }}>
          <Box sx={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isTyping ? '0 0 40px rgba(168,85,247,0.7)' : '0 0 25px rgba(99,102,241,0.3)',
            transition: 'box-shadow 0.4s ease',
            position: 'relative',
            '&::after': {
              content: '""', position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid #6366f1', animation: 'ringPulse 2s infinite'
            }
          }}>
            <Bot size={56} color="#fff" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit', mt: 2 }}>Buddy AI</Typography>
          <Typography variant="caption" sx={{ color: isTyping ? '#a855f7' : isRecording ? '#ec4899' : '#94a3b8', fontWeight: 600, transition: 'color 0.3s' }}>
            {isTyping ? 'Thinking...' : isRecording ? 'Listening...' : 'Ready'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Company</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>{interview?.companyName || '—'}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Topics</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {(interview?.topics || []).map(t => (
              <Box key={t} sx={{ px: 1.5, py: 0.3, borderRadius: '6px', bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.75rem', fontWeight: 600 }}>{t}</Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Mode</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, px: 2, py: 1, borderRadius: '8px', bgcolor: showEditor ? 'rgba(168,85,247,0.1)' : 'rgba(99,102,241,0.1)', color: showEditor ? '#a855f7' : '#6366f1' }}>
            {showEditor ? <Code size={15} /> : <MessageSquare size={15} />}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{showEditor ? 'Coding Round' : 'Technical Discussion'}</Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          color="error"
          startIcon={<PhoneOff size={16} />}
          sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}
          onClick={handleEnd}
        >
          End Interview
        </Button>
      </Box>

      {/* ── Main area ── */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Chat panel */}
        <Box sx={{
          flex: showEditor ? '0 0 40%' : '1 1 100%',
          display: 'flex', flexDirection: 'column',
          borderRight: showEditor ? '1px solid rgba(255,255,255,0.05)' : 'none',
          transition: 'flex 0.3s ease', overflow: 'hidden'
        }}>
          {/* Messages */}
          <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'interviewer' ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                alignSelf: msg.role === 'interviewer' ? 'flex-start' : 'flex-end',
              }}>
                {msg.role === 'interviewer' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Avatar sx={{ width: 22, height: 22, bgcolor: '#6366f1' }}><Bot size={12} /></Avatar>
                    <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>Buddy</Typography>
                    {msg.meta?.openEditor && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: '4px', bgcolor: 'rgba(168,85,247,0.15)', color: '#a855f7', fontSize: '0.65rem', fontWeight: 700 }}>
                        CODING
                      </Box>
                    )}
                  </Box>
                )}
                <Box sx={{
                  p: 2, borderRadius: msg.role === 'interviewer' ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
                  bgcolor: msg.role === 'interviewer' ? 'rgba(30,41,59,0.8)' : '#6366f1',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: msg.role === 'candidate' ? '0 4px 15px rgba(99,102,241,0.25)' : 'none',
                  whiteSpace: 'pre-wrap', lineHeight: 1.7,
                }}>
                  <Typography variant="body2" sx={{ fontSize: '0.92rem' }}>{msg.content}</Typography>
                </Box>
              </Box>
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-start' }}>
                <Avatar sx={{ width: 22, height: 22, bgcolor: '#6366f1' }}><Bot size={12} /></Avatar>
                <Box sx={{ p: 2, borderRadius: '4px 18px 18px 18px', bgcolor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[0, 1, 2].map(i => (
                      <Box key={i} sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#6366f1', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            <div ref={chatEndRef} />
          </Box>

          {/* Input bar */}
          <Box sx={{ p: 2.5, bgcolor: 'rgba(15,23,42,0.9)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <IconButton
                onClick={toggleRecording}
                sx={{
                  bgcolor: isRecording ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
                  color: isRecording ? '#ec4899' : '#94a3b8',
                  border: isRecording ? '1px solid rgba(236,72,153,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  '&:hover': { bgcolor: isRecording ? 'rgba(236,72,153,0.25)' : 'rgba(255,255,255,0.08)' },
                  transition: 'all 0.2s'
                }}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </IconButton>

              <TextField
                fullWidth
                placeholder={isRecording ? 'Listening...' : 'Type your answer or use mic...'}
                variant="outlined"
                size="small"
                value={input + (interimText ? ' ' + interimText : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  setInput(val);
                  finalTranscriptRef.current = val;
                  interimRef.current = '';
                  setInterimText('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                multiline
                maxRows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.25)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                  }
                }}
              />

              <IconButton
                onClick={() => handleSend()}
                disabled={isTyping || (!(input + interimText).trim())}
                sx={{
                  bgcolor: '#6366f1', color: '#fff',
                  '&:hover': { bgcolor: '#4f46e5' },
                  '&:disabled': { bgcolor: 'rgba(99,102,241,0.3)', color: 'rgba(255,255,255,0.3)' }
                }}
              >
                <Send size={20} />
              </IconButton>
            </Box>

            {isRecording && (
              <Typography variant="caption" sx={{ color: '#ec4899', display: 'block', mt: 1, textAlign: 'center', fontWeight: 600 }}>
                Mic is active — speak your answer, then click Send
              </Typography>
            )}
          </Box>
        </Box>

        {/* Coding Editor panel */}
        {showEditor && (
          <Box sx={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', bgcolor: '#1e1e1e', overflow: 'hidden' }}>
            {/* Toolbar */}
            <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Code size={16} color="#a855f7" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff' }}>Coding Workspace</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRunCode}
                  sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)', '&:hover': { borderColor: '#fff', color: '#fff' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                >
                  Run
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSubmitCode}
                  disabled={isTyping}
                  sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  {isTyping ? 'Submitting...' : 'Submit Solution'}
                </Button>
              </Box>
            </Box>

            {/* Monaco Editor */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  folding: true,
                  wordWrap: 'on',
                }}
              />
            </Box>

            {/* Console */}
            <Box sx={{ height: '130px', flexShrink: 0, borderTop: '3px solid #0f172a', bgcolor: '#0d1117', p: 2, overflowY: 'auto' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Console
              </Typography>
              <Typography component="pre" variant="body2" sx={{ color: '#10b981', fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                {consoleOutput || '> Ready to run...'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Global CSS animations */}
      <style>{`
        @keyframes ringPulse {
          0%   { transform: scale(1);   opacity: 0.5; }
          50%  { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1);   opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1;   }
        }
      `}</style>
    </Box>
  );
};

export default LiveInterview;
