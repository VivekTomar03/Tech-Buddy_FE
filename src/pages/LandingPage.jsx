import React from 'react';
import { Container, Typography, Button, Box, Card, CardContent, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Terminal, Mic, BarChart3, ShieldCheck, Zap,
  CheckCircle, ArrowRight, Star, Users, Trophy, Clock
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const LandingPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCTA = () => navigate(user ? '/dashboard' : '/signup');
  const handleSignIn = () => navigate(user ? '/dashboard' : '/login');

  return (
    <Box sx={{ minHeight: '100vh', pt: 8, pb: 0 }}>

      {/* ── Hero ── */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Box sx={{
            display: 'inline-block', px: 2.5, py: 0.8, mb: 3,
            borderRadius: '999px', border: '1px solid rgba(99,102,241,0.4)',
            bgcolor: 'rgba(99,102,241,0.08)'
          }}>
            <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 700, letterSpacing: 1 }}>
              AI-POWERED MOCK INTERVIEWS
            </Typography>
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 800,
              mb: 3,
              background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Master Your Next <br /> Tech Interview with AI
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: '#94a3b8', mb: 5, maxWidth: '700px', mx: 'auto', lineHeight: 1.7 }}
          >
            Experience realistic mock interviews with dynamic AI interviewers.
            Get real-time feedback, coding challenges, and detailed performance analysis.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button
              onClick={handleCTA}
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={18} />}
              sx={{
                px: 6, py: 2, fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)'
              }}
            >
              {user ? 'Go to Dashboard' : 'Get Started for Free'}
            </Button>
            <Button
              onClick={handleSignIn}
              variant="outlined"
              size="large"
              sx={{ px: 6, py: 2, fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              {user ? 'Dashboard' : 'Sign In'}
            </Button>
          </Box>

          {/* Stats row */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 4, md: 8 }, flexWrap: 'wrap', mt: 8, opacity: 0.8 }}>
            {[
              { icon: <Users size={18} />, value: '10,000+', label: 'Developers' },
              { icon: <Star size={18} />, value: '4.9/5', label: 'Rating' },
              { icon: <Trophy size={18} />, value: '87%', label: 'Offer Rate' },
              { icon: <Clock size={18} />, value: '<2s', label: 'Response Time' },
            ].map((s) => (
              <Box key={s.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6366f1' }}>{s.icon}
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>{s.value}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Features ── */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Outfit' }}>Everything You Need to Get Hired</Typography>
            <Typography sx={{ color: '#94a3b8', maxWidth: 500, mx: 'auto' }}>
              A complete interview preparation platform built for serious candidates.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <FeatureCard icon={<Sparkles color="#6366f1" size={32} />} title="Dynamic AI Interviewer"
              description="Our AI adapts its questions based on your performance, just like a real human interviewer." />
            <FeatureCard icon={<Terminal color="#ec4899" size={32} />} title="Live Coding Rounds"
              description="Solve data structure and algorithm problems in our integrated Monaco editor with real-time evaluation." />
            <FeatureCard icon={<Mic color="#8b5cf6" size={32} />} title="Voice Interviews"
              description="Practice your verbal communication skills with our speech-to-text and AI voice interaction." />
            <FeatureCard icon={<BarChart3 color="#06b6d4" size={32} />} title="In-depth Analysis"
              description="Receive detailed reports on your technical knowledge, communication, and hiring readiness." />
            <FeatureCard icon={<ShieldCheck color="#10b981" size={32} />} title="Company Specific"
              description="Mock interviews tailored for specific companies like Google, Meta, or high-growth startups." />
            <FeatureCard icon={<Zap color="#f59e0b" size={32} />} title="Instant Feedback"
              description="Don't wait for days. Get actionable improvement suggestions immediately after your session." />
          </Box>
        </Box>
      </Container>

      {/* ── How It Works ── */}
      <Box sx={{ py: 15, bgcolor: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Outfit' }}>How It Works</Typography>
            <Typography sx={{ color: '#94a3b8', maxWidth: 500, mx: 'auto' }}>
              Go from signup to a full mock interview in under 2 minutes.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, position: 'relative' }}>
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up and tell us your target role, experience level, and which companies you are preparing for.', color: '#6366f1' },
              { step: '02', title: 'Set Up the Interview', desc: 'Choose topics, difficulty, and interview type — technical, behavioural, or a full mock round.', color: '#8b5cf6' },
              { step: '03', title: 'Interview with AI', desc: 'Answer questions via voice or text. The AI adapts in real time and opens a coding editor when needed.', color: '#a855f7' },
              { step: '04', title: 'Get Your Report', desc: 'Receive a detailed performance report with scores, strengths, weak areas, and a personalised roadmap.', color: '#ec4899' },
            ].map((s, i) => (
              <Box key={i} sx={{ flex: 1, position: 'relative' }}>
                <Box sx={{
                  p: 4, borderRadius: '20px',
                  bgcolor: 'rgba(30,41,59,0.5)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  height: '100%'
                }}>
                  <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: s.color, opacity: 0.25, lineHeight: 1, mb: 2, fontFamily: 'Outfit' }}>
                    {s.step}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>{s.title}</Typography>
                  <Typography sx={{ color: '#94a3b8', lineHeight: 1.7 }}>{s.desc}</Typography>
                </Box>
                {i < 3 && (
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', zIndex: 1, color: '#334155' }}>
                    <ArrowRight size={24} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Testimonials ── */}
      <Box sx={{ py: 15 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Outfit' }}>What Developers Say</Typography>
            <Typography sx={{ color: '#94a3b8' }}>Real results from real candidates.</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[
              { name: 'Aditya Sharma', role: 'SDE-2 at Amazon', text: 'TechBuddy helped me go from failing phone screens to clearing all 4 rounds at Amazon. The AI interviewer felt surprisingly real.', rating: 5 },
              { name: 'Priya Mehta', role: 'Frontend Engineer at Google', text: 'The coding rounds with Monaco editor are excellent. I could practise DSA in the exact same environment as the real interview.', rating: 5 },
              { name: 'Rahul Verma', role: 'Backend Dev at Razorpay', text: 'The detailed report after each session was a game changer. I knew exactly what to improve before my next round.', rating: 5 },
              { name: 'Sneha Patil', role: 'Full Stack at Swiggy', text: 'I loved the voice interview feature. Speaking answers aloud instead of just typing made a huge difference to my confidence.', rating: 5 },
            ].map((t, i) => (
              <Box key={i} sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
                <Card sx={{
                  height: '100%', p: 1,
                  background: 'rgba(30,41,59,0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </Box>
                    <Typography sx={{ color: '#cbd5e1', lineHeight: 1.8, mb: 4, fontStyle: 'italic' }}>
                      "{t.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#6366f1', width: 44, height: 44, fontWeight: 800 }}>
                        {t.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 600 }}>{t.role}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── What's Included ── */}
      <Box sx={{ py: 15, bgcolor: 'rgba(15,23,42,0.6)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Outfit' }}>Everything Included, Free to Start</Typography>
            <Typography sx={{ color: '#94a3b8' }}>No credit card required. No hidden fees.</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {[
              'Unlimited mock interviews', 'Voice & text input', 'Live Monaco code editor',
              'DSA & system design rounds', 'AI-generated performance reports', 'Company-specific preparation',
              'Adaptive difficulty', 'Behavioural interview practice', 'Detailed improvement roadmap',
              'Interview history dashboard',
            ].map((item) => (
              <Box key={item} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 3, py: 1.5, borderRadius: '12px',
                bgcolor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)'
              }}>
                <CheckCircle size={16} color="#10b981" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CTA Banner ── */}
      <Box sx={{ py: 15 }}>
        <Container maxWidth="md">
          <Box sx={{
            textAlign: 'center', p: { xs: 6, md: 10 },
            borderRadius: '32px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 80px -20px rgba(99,102,241,0.3)'
          }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Outfit' }}>
              Ready to Land Your Dream Job?
            </Typography>
            <Typography sx={{ color: '#94a3b8', mb: 6, fontSize: '1.1rem', maxWidth: 480, mx: 'auto' }}>
              Join thousands of developers who used TechBuddy to crack interviews at top tech companies.
            </Typography>
            <Button
              onClick={handleCTA}
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={20} />}
              sx={{
                px: 8, py: 2.5, fontSize: '1.1rem', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 15px 35px -5px rgba(99,102,241,0.5)',
                '&:hover': { transform: 'scale(1.03)' }
              }}
            >
              {user ? 'Go to Dashboard' : 'Start Practicing for Free'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Trusted By ── */}
      <Box sx={{ py: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', opacity: 0.5 }}>
            <Typography variant="body2" sx={{ mb: 4, textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b' }}>
              Trusted by developers from
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 4, md: 8 }, flexWrap: 'wrap' }}>
              {['GOOGLE', 'META', 'AMAZON', 'MICROSOFT', 'NETFLIX', 'RAZORPAY'].map(c => (
                <Typography key={c} variant="h6" fontWeight={800}>{c}</Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ py: 6, borderTop: '1px solid rgba(255,255,255,0.06)', bgcolor: 'rgba(15,23,42,0.8)' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Outfit', mb: 0.5 }}>
                TechBuddy <Box component="span" sx={{ color: '#6366f1' }}>AI</Box>
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569' }}>
                © {new Date().getFullYear()} TechBuddy. All rights reserved.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Blog'].map(l => (
                <Typography key={l} variant="body2" sx={{ color: '#64748b', cursor: 'pointer', '&:hover': { color: '#fff' } }}>{l}</Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Box sx={{ width: { xs: '100%', md: 'calc(50% - 16px)' } }}>
    <Card sx={{
      height: '100%',
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '20px',
      transition: 'transform 0.3s, border-color 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        borderColor: 'rgba(99, 102, 241, 0.3)'
      }
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>{icon}</Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, fontFamily: 'Outfit' }}>
          {title}
        </Typography>
        <Typography sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

export default LandingPage;
