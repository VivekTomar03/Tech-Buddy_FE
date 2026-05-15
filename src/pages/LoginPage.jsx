import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';

import useAuthStore from '../store/useAuthStore';
import { Alert, CircularProgress } from '@mui/material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={0} className="glass-card" sx={{ p: 5, width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Brain size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit', mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography sx={{ color: '#94a3b8' }}>
              Log in to continue your interview preparation
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 4 }}
            />
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/signup" variant="body2" sx={{ color: '#6366f1', textDecoration: 'none' }}>
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
