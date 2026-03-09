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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { GET_CLIENTS, CREATE_CLIENT, UPDATE_CLIENT, DELETE_CLIENT } from '@/graphql/queries';

export default function ClientsPage() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
  const [error, setError] = useState('');

  const { data, loading, refetch } = useQuery(GET_CLIENTS);

  const [createClient, { loading: creating }] = useMutation(CREATE_CLIENT, {
    onCompleted: () => {
      handleClose();
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [updateClient, { loading: updating }] = useMutation(UPDATE_CLIENT, {
    onCompleted: () => {
      handleClose();
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteClient, { loading: deleting }] = useMutation(DELETE_CLIENT, {
    onCompleted: () => refetch(),
    onError: (err) => setError(err.message),
  });

  const handleOpen = (client?: any) => {
    if (client) {
      setEditId(client.id);
      setForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        address: client.address || '',
        notes: client.notes || '',
      });
    } else {
      setEditId(null);
      setForm({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
  };

  const handleSubmit = () => {
    if (editId) {
      updateClient({ variables: { id: editId, ...form } });
    } else {
      createClient({ variables: form });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClient({ variables: { id } });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Client
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.clients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No clients yet. Add your first client!</TableCell>
                </TableRow>
              ) : (
                data?.clients?.map((client: any) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(client)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(client.id)} color="error">
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
        <DialogTitle>{editId ? 'Edit Client' : 'Add Client'}</DialogTitle>
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
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
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
