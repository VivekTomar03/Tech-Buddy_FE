import React, { useState, useEffect } from 'react';
import { Container, Stack, Paper, Typography, Box, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PlayCircle, Award, Target, MessageSquare, Code, TrendingUp, History, Info } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate chart data from real interviews
  const chartData = (interviews || [])
    .filter(i => i && i.status === 'Completed' && i.score)
    .map((i, idx) => ({
      name: `Int ${idx + 1}`,
      score: i.score
    }))
    .reverse();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get('/interviews');
        setInterviews(response.data.data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
            Candidate Dashboard
          </Typography>
          <Typography sx={{ color: '#94a3b8' }}>
            Welcome back, {user?.name}! {interviews.length > 0 ? "Track your progress below." : "Start your first interview to see analysis."}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PlayCircle />}
          onClick={() => navigate('/setup')}
          sx={{ 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            px: 3, py: 1.5, borderRadius: '10px'
          }}
        >
          Start New Interview
        </Button>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={3} sx={{ mb: 5 }}>
        <StatCard icon={<History size={24} color="#6366f1" />} label="Total Interviews" value={interviews.length} />
        <StatCard icon={<Award size={24} color="#ec4899" />} label="Avg. Score" value={interviews.length > 0 && interviews.some(i => i.score) ? `${Math.round(interviews.filter(i => i.score).reduce((acc, curr) => acc + curr.score, 0) / interviews.filter(i => i.score).length)}%` : '--'} />
        <StatCard icon={<Target size={24} color="#8b5cf6" />} label="Hiring Readiness" value={interviews.length > 3 ? "MNC Ready" : "Practicing"} />
        <StatCard icon={<TrendingUp size={24} color="#10b981" />} label="Improvement" value={(() => {
          const scores = interviews.filter(i => i.score).map(i => i.score).reverse();
          if (scores.length < 2) return '--';
          const diff = scores[scores.length - 1] - scores[0];
          return (diff >= 0 ? '+' : '') + diff + '%';
        })()} />
      </Stack>

      {/* Row 1: Charts side by side */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 5 }}>
        {/* Performance Trend */}
        <Box sx={{ flex: '0 0 65%' }}>
          <Paper className="glass-card" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>Performance Trend</Typography>
            <Box sx={{ height: 300, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                  <TrendingUp size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <Typography>No interview data available yet to show trends.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Skill Analysis */}
        <Box sx={{ flex: '1 1 35%' }}>
          <Paper className="glass-card" sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Skill Analysis</Typography>
            {(() => {
              const completed = interviews.filter(i => i.status === 'Completed' && i.technicalScore);
              if (completed.length === 0) {
                return (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5, textAlign: 'center' }}>
                    <Target size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Complete an interview to receive a detailed skill breakdown and AI recommendations.</Typography>
                  </Box>
                );
              }
              const avg = (key) => Math.round(completed.reduce((s, i) => s + (i[key] || 0), 0) / completed.length);
              const latest = completed[0];
              return (
                <>
                  <SkillMetric label="Technical Depth" value={avg('technicalScore')} color="#6366f1" />
                  <SkillMetric label="Communication" value={avg('communicationScore')} color="#ec4899" />
                  <SkillMetric label="Problem Solving" value={avg('problemSolvingScore')} color="#8b5cf6" />
                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
                  <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 2 }}>Latest Recommendations</Typography>
                  {(latest?.improvementPlan || []).slice(0, 3).map((tip, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 1, color: '#cbd5e1' }}>• {tip}</Typography>
                  ))}
                </>
              );
            })()}
          </Paper>
        </Box>
      </Stack>

      {/* Row 2: Recent Interviews full width */}
      <Paper className="glass-card" sx={{ p: 4, width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Recent Interviews</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Company</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Topics</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Score</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : interviews.length > 0 ? (
                interviews.map((interview) => (
                  <InterviewRow
                    key={interview._id}
                    id={interview._id}
                    company={interview.companyName}
                    topics={interview.topics?.join(', ') || 'N/A'}
                    score={interview.score ? `${interview.score}%` : '--'}
                    status={interview.status}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                    No interviews found. Start your first mock interview!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

const StatCard = ({ icon, label, value }) => (
  <Paper className="glass-card" sx={{ p: 3, flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" sx={{ color: '#94a3b8' }}>{label}</Typography>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{value}</Typography>
    </Box>
  </Paper>
);

const SkillMetric = ({ label, value, color }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: color, fontWeight: 700 }}>{value}%</Typography>
    </Box>
    <Box sx={{ height: 6, width: '100%', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
      <Box sx={{ height: '100%', width: `${value}%`, bgcolor: color, borderRadius: 3 }} />
    </Box>
  </Box>
);

const InterviewRow = ({ id, company, topics, score, status }) => {
  const navigate = useNavigate();
  return (
    <TableRow>
      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>{company}</TableCell>
      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8' }}>{topics}</TableCell>
      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700 }}>{score}</TableCell>
      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Box component="span" sx={{ px: 1.5, py: 0.5, borderRadius: '20px', fontSize: '0.75rem', bgcolor: status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: status === 'Completed' ? '#10b981' : '#f59e0b' }}>
          {status}
        </Box>
      </TableCell>
      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} align="right">
        <Button 
          size="small" 
          variant="text" 
          sx={{ color: '#6366f1' }}
          onClick={() => navigate(status === 'Completed' ? `/report/${id}` : `/interview/${id}`)}
        >
          {status === 'Completed' ? 'View Report' : 'Continue'}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default Dashboard;
