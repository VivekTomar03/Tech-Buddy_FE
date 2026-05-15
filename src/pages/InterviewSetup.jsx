import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Grid, MenuItem, FormControlLabel, Switch, Chip, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Play, Settings2, Info } from 'lucide-react';

import api from '../api/axios';
import { CircularProgress } from '@mui/material';

const subjects = [
  'React', 'JavaScript', 'Node.js', 'MongoDB', 'Express', 'HTML/CSS', 
  'DSA', 'System Design', 'Python', 'Java', 'TypeScript', 'SQL'
];

const InterviewSetup = () => {
  const [formData, setFormData] = useState({
    candidateName: '',
    companyName: '',
    topics: [],
    experienceLevel: 'Beginner',
    duration: 30,
    includeCoding: true,
    voiceInterview: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/interviews', formData);
      const interviewId = response.data.data._id;
      navigate(`/interview/${interviewId}`);
    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Failed to start interview. Please check your AI API keys.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 10 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'Outfit', mb: 2 }}>
          Setup Your Interview
        </Typography>
        <Typography sx={{ color: '#94a3b8' }}>
          Configure your preferences to get a tailored interview experience.
        </Typography>
      </Box>

      <Paper className="glass-card" sx={{ p: 5 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Candidate Name"
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                required
                placeholder="e.g. John Doe"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Company"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                placeholder="e.g. Google, Meta, or Startup"
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={subjects}
                value={formData.topics}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, topics: newValue });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Topics / Subjects" placeholder="Select topics" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Experience Level"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Duration (Minutes)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              >
                <MenuItem value={15}>15 Minutes (Quick)</MenuItem>
                <MenuItem value={30}>30 Minutes (Standard)</MenuItem>
                <MenuItem value={60}>60 Minutes (Full)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings2 size={18} /> Interview Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch checked={formData.includeCoding} onChange={(e) => setFormData({ ...formData, includeCoding: e.target.checked })} color="primary" />}
                      label="Include Coding Round"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch checked={formData.voiceInterview} onChange={(e) => setFormData({ ...formData, voiceInterview: e.target.checked })} color="primary" />}
                      label="Enable Voice Interview (Beta)"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8', fontSize: '0.875rem', mb: 3 }}>
                <Info size={16} />
                <Typography variant="caption">The AI will generate questions based on these settings.</Typography>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? null : <Play />}
                disabled={loading}
                sx={{ 
                  py: 2,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Mock Interview'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default InterviewSetup;
