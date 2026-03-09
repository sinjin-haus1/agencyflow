'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { PlayArrow, Stop, Add, Delete } from '@mui/icons-material';
import { GET_TIME_ENTRIES, GET_PROJECTS, CREATE_TIME_ENTRY, START_TIMER, STOP_TIMER, DELETE_TIME_ENTRY } from '@/graphql/queries';

export default function TimePage() {
  const [open, setOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [form, setForm] = useState({ description: '', projectId: '', billable: true });
  const [error, setError] = useState('');

  const { data, loading, refetch } = useQuery(GET_TIME_ENTRIES);
  const { data: projectsData } = useQuery(GET_PROJECTS);

  const [startTimer, { loading: starting }] = useMutation(START_TIMER, {
    onCompleted: (data) => {
      setActiveTimer(data.startTimer);
      setOpen(false);
    },
    onError: (err) => setError(err.message),
  });

  const [stopTimer, { loading: stopping }] = useMutation(STOP_TIMER, {
    onCompleted: () => {
      setActiveTimer(null);
      setTimerElapsed(0);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [createEntry, { loading: creating }] = useMutation(CREATE_TIME_ENTRY, {
    onCompleted: () => {
      setOpen(false);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteEntry, { loading: deleting }] = useMutation(DELETE_TIME_ENTRY, {
    onCompleted: () => refetch(),
    onError: (err) => setError(err.message),
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        const start = new Date(activeTimer.startTime).getTime();
        const now = Date.now();
        setTimerElapsed(Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleStartTimer = () => {
    startTimer({ variables: { description: form.description, projectId: form.projectId || null, billable: form.billable } });
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      stopTimer({ variables: { id: activeTimer.id } });
    }
  };

  const handleAddEntry = () => {
    createEntry({ variables: { description: form.description, projectId: form.projectId || null, billable: form.billable } });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this time entry?')) {
      deleteEntry({ variables: { id } });
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projectsData?.projects?.find((p: any) => p.id === projectId);
    return project?.name || '-';
  };

  const totalHours = data?.timeEntries?.reduce((acc: number, entry: any) => acc + (entry.duration || 0), 0) || 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Time Tracking</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h6">
                {activeTimer ? (
                  <>Timer Running: <Box component="span" sx={{ color: 'primary.main', fontFamily: 'monospace' }}>{formatTime(timerElapsed)}</Box></>
                ) : (
                  'Start Timer'
                )}
              </Typography>
            </Grid>
            {activeTimer && (
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  {activeTimer.description}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
              {activeTimer ? (
                <Button variant="contained" color="error" startIcon={<Stop />} onClick={handleStopTimer} disabled={stopping}>
                  Stop
                </Button>
              ) : (
                <Button variant="contained" color="success" startIcon={<PlayArrow />} onClick={() => setOpen(true)}>
                  Start Timer
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Time Entries ({formatDuration(totalHours)} total)
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Billable</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.timeEntries?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No time entries yet.</TableCell>
                </TableRow>
              ) : (
                data?.timeEntries?.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.startTime).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{getProjectName(entry.projectId)}</TableCell>
                    <TableCell>{entry.duration ? formatDuration(entry.duration) : 'Running'}</TableCell>
                    <TableCell>{entry.billable ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleDelete(entry.id)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start Timer</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Project</InputLabel>
            <Select
              value={form.projectId}
              label="Project"
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              <MenuItem value="">No Project</MenuItem>
              {projectsData?.projects?.map((project: any) => (
                <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Billable</InputLabel>
            <Select
              value={form.billable.toString()}
              label="Billable"
              onChange={(e) => setForm({ ...form, billable: e.target.value === 'true' })}
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleStartTimer} variant="contained" disabled={starting}>
            {starting ? <CircularProgress size={24} /> : 'Start'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
