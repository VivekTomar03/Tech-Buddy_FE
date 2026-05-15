import React from 'react';
import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Sparkles, Terminal, Mic, BarChart3, ShieldCheck, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', pt: 8, pb: 10 }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 10 }}>
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
            sx={{ color: '#94a3b8', mb: 5, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}
          >
            Experience realistic mock interviews with dynamic AI interviewers.
            Get real-time feedback, coding challenges, and detailed performance analysis.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
              }}
            >
              Get Started for Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ px: 6, py: 2, fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              View Demo
            </Button>
          </Box>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 15 }}>
          <FeatureCard
            icon={<Sparkles color="#6366f1" size={32} />}
            title="Dynamic AI Interviewer"
            description="Our AI adapts its questions based on your performance, just like a real human interviewer."
          />
          <FeatureCard
            icon={<Terminal color="#ec4899" size={32} />}
            title="Live Coding Rounds"
            description="Solve data structure and algorithm problems in our integrated Monaco editor with real-time evaluation."
          />
          <FeatureCard
            icon={<Mic color="#8b5cf6" size={32} />}
            title="Voice Interviews"
            description="Practice your verbal communication skills with our speech-to-text and AI voice interaction."
          />
          <FeatureCard
            icon={<BarChart3 color="#06b6d4" size={32} />}
            title="In-depth Analysis"
            description="Receive detailed reports on your technical knowledge, communication, and hiring readiness."
          />
          <FeatureCard
            icon={<ShieldCheck color="#10b981" size={32} />}
            title="Company Specific"
            description="Mock interviews tailored for specific companies like Google, Meta, or high-growth startups."
          />
          <FeatureCard
            icon={<Zap color="#f59e0b" size={32} />}
            title="Instant Feedback"
            description="Don't wait for days. Get actionable improvement suggestions immediately after your session."
          />
        </Grid>

        {/* Social Proof Placeholder */}
        <Box sx={{ textAlign: 'center', opacity: 0.6 }}>
          <Typography variant="body1" sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
            Trusted by developers from
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 4, md: 8 }, flexWrap: 'wrap' }}>
            <Typography variant="h6" fontWeight={800}>GOOGLE</Typography>
            <Typography variant="h6" fontWeight={800}>META</Typography>
            <Typography variant="h6" fontWeight={800}>AMAZON</Typography>
            <Typography variant="h6" fontWeight={800}>MICROSOFT</Typography>
            <Typography variant="h6" fontWeight={800}>NETFLIX</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Grid item xs={12} md={4}>
    <Card sx={{
      height: '100%',
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.05)',
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
  </Grid>
);

export default LandingPage;
