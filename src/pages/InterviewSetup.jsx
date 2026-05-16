import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button, Paper,
  MenuItem, FormControlLabel, Switch, Chip, Autocomplete, Stack, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Play, Settings2, Info, Lock } from 'lucide-react';
import api from '../api/axios';
import { CircularProgress } from '@mui/material';

const PRESET_TOPICS = [
  'React', 'JavaScript', 'Node.js', 'MongoDB', 'Express', 'HTML/CSS',
  'DSA', 'System Design', 'Python', 'Java', 'TypeScript', 'SQL',
  'Next.js', 'Redux', 'REST API', 'GraphQL', 'Docker', 'AWS',
];

const InterviewSetup = () => {
  const [formData, setFormData] = useState({
    candidateName: '',
    companyName: '',
    topics: [],
    experienceLevel: 'Beginner',
    duration: 30,
    includeCoding: true,
    voiceInterview: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.topics.length === 0) {
      alert('Please select at least one topic.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/interviews', formData);
      navigate(`/interview/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Failed to start interview. Please check your AI API keys.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 10 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'Outfit', mb: 2 }}>
          Setup Your Interview
        </Typography>
        <Typography sx={{ color: '#94a3b8' }}>
          Configure your preferences to get a tailored interview experience.
        </Typography>
      </Box>

      <Paper className="glass-card" sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>

            {/* Row 1: Name + Company */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <TextField
                fullWidth
                label="Candidate Name"
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                required
                placeholder="e.g. John Doe"
              />
              <TextField
                fullWidth
                label="Target Company"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                placeholder="e.g. Google, Meta, Startup"
              />
            </Stack>

            {/* Topics — full width, supports custom entries */}
            <Autocomplete
              multiple
              freeSolo
              options={PRESET_TOPICS}
              value={formData.topics}
              onChange={(_, newValue) => setFormData({ ...formData, topics: newValue })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    {...getTagProps({ index })}
                    sx={{ bgcolor: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontWeight: 600 }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Topics / Subjects"
                  placeholder="Select or type a custom topic, then press Enter"
                  helperText="Pick from the list or type any custom topic and press Enter to add it"
                />
              )}
            />

            {/* Row 2: Experience + Duration */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
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
            </Stack>

            {/* Interview Options */}
            <Box sx={{
              p: 3, borderRadius: '16px',
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings2 size={18} /> Interview Options
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.includeCoding}
                      onChange={(e) => setFormData({ ...formData, includeCoding: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Include Coding Round"
                />
                <Tooltip title="Coming Soon" arrow placement="top">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={false}
                          disabled
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Enable Voice Interview
                          <Box sx={{
                            display: 'inline-flex', alignItems: 'center', gap: 0.5,
                            px: 1, py: 0.2, borderRadius: '6px',
                            bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                            color: '#f59e0b', fontSize: '0.65rem', fontWeight: 700
                          }}>
                            <Lock size={10} /> COMING SOON
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                </Tooltip>
              </Stack>
            </Box>

            {/* Submit */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b', mb: 2 }}>
                <Info size={15} />
                <Typography variant="caption">The AI will generate adaptive questions based on your settings.</Typography>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? null : <Play size={20} />}
                disabled={loading}
                sx={{
                  py: 2,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: '0 10px 30px -5px rgba(99,102,241,0.4)',
                  '&:hover': { transform: 'scale(1.01)' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Mock Interview'}
              </Button>
            </Box>

          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default InterviewSetup;
