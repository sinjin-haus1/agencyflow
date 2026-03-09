'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Card,
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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { GET_PROJECTS, GET_CLIENTS, CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT } from '@/graphql/queries';

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'ACTIVE', clientId: '', budget: 0, hourlyRate: 0 });
  const [error, setError] = useState('');

  const { data: projectsData, loading: projectsLoading, refetch: refetchProjects } = useQuery(GET_PROJECTS);
  const { data: clientsData } = useQuery(GET_CLIENTS);

  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      handleClose();
      refetchProjects();
    },
    onError: (err) => setError(err.message),
  });

  const [updateProject, { loading: updating }] = useMutation(UPDATE_PROJECT, {
    onCompleted: () => {
      handleClose();
      refetchProjects();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteProject, { loading: deleting }] = useMutation(DELETE_PROJECT, {
    onCompleted: () => refetchProjects(),
    onError: (err) => setError(err.message),
  });

  const handleOpen = (project?: any) => {
    if (project) {
      setEditId(project.id);
      setForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'ACTIVE',
        clientId: project.clientId || '',
        budget: project.budget || 0,
        hourlyRate: project.hourlyRate || 0,
      });
    } else {
      setEditId(null);
      setForm({ name: '', description: '', status: 'ACTIVE', clientId: '', budget: 0, hourlyRate: 0 });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm({ name: '', description: '', status: 'ACTIVE', clientId: '', budget: 0, hourlyRate: 0 });
  };

  const handleSubmit = () => {
    const variables = {
      name: form.name,
      description: form.description,
      status: form.status,
      clientId: form.clientId || null,
      budget: form.budget || null,
      hourlyRate: form.hourlyRate || null,
    };
    if (editId) {
      updateProject({ variables: { id: editId, ...variables } });
    } else {
      createProject({ variables });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject({ variables: { id } });
    }
  };

  const getClientName = (clientId: string) => {
    const client = clientsData?.clients?.find((c: any) => c.id === clientId);
    return client?.name || '-';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Project
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {projectsLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectsData?.projects?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No projects yet. Create your first project!</TableCell>
                </TableRow>
              ) : (
                projectsData?.projects?.map((project: any) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.description}</TableCell>
                    <TableCell>{getClientName(project.clientId)}</TableCell>
                    <TableCell>{project.status}</TableCell>
                    <TableCell>${project.budget || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(project)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(project.id)} color="error">
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Client</InputLabel>
            <Select
              value={form.clientId}
              label="Client"
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              <MenuItem value="">No Client</MenuItem>
              {clientsData?.clients?.map((client: any) => (
                <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Budget"
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Hourly Rate"
            type="number"
            value={form.hourlyRate}
            onChange={(e) => setForm({ ...form, hourlyRate: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={creating || updating}>
            {creating || updating ? <CircularProgress size={24} /> : editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
