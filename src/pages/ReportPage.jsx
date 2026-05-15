import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Box, Typography, Button,
  Divider, CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        setInterview(res.data.data);
      } catch (err) {
        setError('Could not load interview report.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (error || !interview) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#94a3b8', mb: 3 }}>{error || 'Report not found.'}</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ bgcolor: '#6366f1' }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const report = interview.analysis || {};

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper sx={{
        p: { xs: 3, md: 5 }, borderRadius: '24px',
        bgcolor: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit', mb: 0.5 }}>
              Interview Report
            </Typography>
            <Typography sx={{ color: '#94a3b8' }}>
              {interview.companyName} — {interview.topics?.join(', ')}
            </Typography>
          </Box>
          <Box sx={{ px: 2.5, py: 1, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>
            {interview.recommendation || report.recommendation || 'Startup Ready'}
          </Box>
        </Box>

        <Divider sx={{ mb: 5, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Score cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
          {[
            { label: 'Overall', value: interview.score || report.overallScore || 0, color: '#6366f1' },
            { label: 'Communication', value: interview.communicationScore || report.communicationScore || 0, color: '#a855f7' },
            { label: 'Problem Solving', value: interview.problemSolvingScore || report.problemSolvingScore || 0, color: '#ec4899' },
            { label: 'Technical Depth', value: interview.technicalScore || report.technicalScore || 0, color: '#10b981' },
          ].map((s) => (
            <Paper key={s.label} sx={{ p: 3, textAlign: 'center', borderRadius: '20px', bgcolor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress variant="determinate" value={s.value} size={80} thickness={4} sx={{ color: s.color }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{s.value}%</Typography>
                </Box>
              </Box>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>{s.label}</Typography>
            </Paper>
          ))}
        </Box>

        {/* Subject breakdown */}
        {(report.subjectBreakdown || interview.subjectBreakdown)?.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Subject Breakdown</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {(report.subjectBreakdown || interview.subjectBreakdown || []).map((s, i) => (
                <Box key={i} sx={{ px: 2.5, py: 1.5, borderRadius: '12px', bgcolor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.subject}</Typography>
                  <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>{s.score}%</Typography>
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
            {(interview.strongAreas || report.strongAreas || []).map((item, i) => (
              <Box key={i} sx={{ p: 2, mb: 1.5, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.9rem' }}>
                {item}
              </Box>
            ))}
            {!(interview.strongAreas || report.strongAreas)?.length && (
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>No specific strengths recorded.</Typography>
            )}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: '#ec4899', mr: 1 }} />
              Weak Areas
            </Typography>
            {(interview.weakAreas || report.weakAreas || []).map((item, i) => (
              <Box key={i} sx={{ p: 2, mb: 1.5, borderRadius: '12px', bgcolor: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)', color: '#ec4899', fontSize: '0.9rem' }}>
                {item}
              </Box>
            ))}
            {!(interview.weakAreas || report.weakAreas)?.length && (
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>No weak areas identified.</Typography>
            )}
          </Box>
        </Box>

        {/* Improvement plan */}
        {(interview.improvementPlan || report.improvementPlan)?.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Improvement Roadmap</Typography>
            <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
              {(interview.improvementPlan || report.improvementPlan || []).map((step, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: i < (interview.improvementPlan || report.improvementPlan).length - 1 ? 2 : 0 }}>
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
};

export default ReportPage;
