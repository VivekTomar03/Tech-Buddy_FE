import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Link, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';

import useAuthStore from '../store/useAuthStore';
import { Alert, CircularProgress } from '@mui/material';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    experienceLevel: 'Beginner'
  });
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={0} className="glass-card" sx={{ p: 5, width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Brain size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit', mb: 1 }}>
              Join TechBuddy AI
            </Typography>
            <Typography sx={{ color: '#94a3b8' }}>
              Start your journey to becoming interview-ready
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="normal"
              fullWidth
              name="experienceLevel"
              label="Experience Level"
              value={formData.experienceLevel}
              onChange={handleChange}
              sx={{ mb: 4 }}
            >
              <MenuItem value="Beginner">Beginner (0-2 years)</MenuItem>
              <MenuItem value="Intermediate">Intermediate (2-5 years)</MenuItem>
              <MenuItem value="Advanced">Advanced (5+ years)</MenuItem>
            </TextField>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                py: 1.5, 
                mb: 3,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontWeight: 700
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2" sx={{ color: '#6366f1', textDecoration: 'none' }}>
                {"Already have an account? Log In"}
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupPage;
