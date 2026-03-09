'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Chip, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material';
import { Add, Edit, Delete, Send, Paid, RemoveCircleOutline, AddCircleOutline } from '@mui/icons-material';
import {
  GET_INVOICES, GET_CLIENTS, GET_PROJECTS,
  CREATE_INVOICE, UPDATE_INVOICE, DELETE_INVOICE, MARK_AS_PAID, SEND_INVOICE,
} from '@/graphql/queries';

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'default', sent: 'info', paid: 'success', overdue: 'error', cancelled: 'warning',
};

interface LineItem { description: string; quantity: string; rate: string; }
interface InvoiceForm {
  clientId: string; projectId: string; tax: string; dueDate: string; notes: string; lineItems: LineItem[];
}

const emptyLine: LineItem = { description: '', quantity: '1', rate: '' };
const emptyForm: InvoiceForm = { clientId: '', projectId: '', tax: '0', dueDate: '', notes: '', lineItems: [{ ...emptyLine }] };

export default function InvoicesPage() {
  const { data, loading, error } = useQuery(GET_INVOICES);
  const { data: clientsData } = useQuery(GET_CLIENTS);
  const { data: projectsData } = useQuery(GET_PROJECTS);

  const refetch = { refetchQueries: [{ query: GET_INVOICES }] };
  const [createInvoice] = useMutation(CREATE_INVOICE, refetch);
  const [updateInvoice] = useMutation(UPDATE_INVOICE, refetch);
  const [deleteInvoice] = useMutation(DELETE_INVOICE, refetch);
  const [markAsPaid] = useMutation(MARK_AS_PAID, refetch);
  const [sendInvoice] = useMutation(SEND_INVOICE, refetch);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  const clients = clientsData?.clients || [];
  const projects = projectsData?.projects || [];
  const getClientName = (id: string) => clients.find((c: any) => c.id === id)?.name || 'Unknown';

  const handleOpen = (invoice?: any) => {
    if (invoice) {
      setEditId(invoice.id);
      setForm({
        clientId: invoice.clientId, projectId: invoice.projectId || '',
        tax: invoice.tax?.toString() || '0',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        notes: invoice.notes || '',
        lineItems: invoice.lineItems.map((li: any) => ({
          description: li.description, quantity: li.quantity.toString(), rate: li.rate.toString(),
        })),
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setSubmitError('');
    setOpen(true);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const items = [...form.lineItems];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, lineItems: items });
  };

  const addLineItem = () => setForm({ ...form, lineItems: [...form.lineItems, { ...emptyLine }] });
  const removeLineItem = (index: number) => {
    if (form.lineItems.length <= 1) return;
    setForm({ ...form, lineItems: form.lineItems.filter((_, i) => i !== index) });
  };

  const calcSubtotal = () => form.lineItems.reduce((sum, li) => sum + (parseFloat(li.quantity) || 0) * (parseFloat(li.rate) || 0), 0);

  const handleSubmit = async () => {
    try {
      const lineItems = form.lineItems.map((li) => ({
        description: li.description, quantity: parseFloat(li.quantity) || 0, rate: parseFloat(li.rate) || 0,
      }));
      const input: any = {
        clientId: form.clientId, lineItems,
        tax: parseFloat(form.tax) || 0,
        dueDate: new Date(form.dueDate).toISOString(),
      };
      if (form.projectId) input.projectId = form.projectId;
      if (form.notes) input.notes = form.notes;

      if (editId) {
        await updateInvoice({ variables: { id: editId, input } });
      } else {
        await createInvoice({ variables: { input } });
      }
      setOpen(false);
    } catch (err: any) {
      setSubmitError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteInvoice({ variables: { id } });
    setDeleteConfirm(null);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const invoices = data?.invoices || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Invoices</Typography>
          <Typography variant="body2" color="text.secondary">{invoices.length} total invoices</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Create Invoice</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Client</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No invoices yet. Create your first invoice.</Typography>
              </TableCell></TableRow>
            ) : (
              invoices.map((inv: any) => (
                <TableRow key={inv.id} hover>
                  <TableCell><Typography fontWeight={500}>{inv.invoiceNumber}</Typography></TableCell>
                  <TableCell>{getClientName(inv.clientId)}</TableCell>
                  <TableCell><Chip label={inv.status} size="small" color={STATUS_COLORS[inv.status] || 'default'} /></TableCell>
                  <TableCell><Typography fontWeight={600}>${inv.total.toLocaleString()}</Typography></TableCell>
                  <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    {inv.status === 'draft' && (
                      <Tooltip title="Send"><IconButton size="small" color="primary" onClick={() => sendInvoice({ variables: { id: inv.id } })}><Send /></IconButton></Tooltip>
                    )}
                    {(inv.status === 'sent' || inv.status === 'overdue') && (
                      <Tooltip title="Mark Paid"><IconButton size="small" color="success" onClick={() => markAsPaid({ variables: { id: inv.id } })}><Paid /></IconButton></Tooltip>
                    )}
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(inv)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(inv.id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
        <DialogContent>
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Client</InputLabel>
              <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} label="Client">
                {clients.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Project (optional)</InputLabel>
              <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} label="Project (optional)">
                <MenuItem value="">None</MenuItem>
                {projects.filter((p: any) => !form.clientId || p.clientId === form.clientId).map((p: any) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Due Date" type="date" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} margin="normal"
              InputLabelProps={{ shrink: true }} required />
            <TextField fullWidth label="Tax ($)" type="number" value={form.tax}
              onChange={(e) => setForm({ ...form, tax: e.target.value })} margin="normal" />
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Line Items</Typography>

          {form.lineItems.map((li, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <TextField label="Description" value={li.description} onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                size="small" sx={{ flexGrow: 1 }} />
              <TextField label="Qty" type="number" value={li.quantity} onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                size="small" sx={{ width: 80 }} />
              <TextField label="Rate" type="number" value={li.rate} onChange={(e) => updateLineItem(idx, 'rate', e.target.value)}
                size="small" sx={{ width: 100 }} />
              <Typography sx={{ width: 80, textAlign: 'right' }}>
                ${((parseFloat(li.quantity) || 0) * (parseFloat(li.rate) || 0)).toFixed(2)}
              </Typography>
              <IconButton size="small" onClick={() => removeLineItem(idx)} disabled={form.lineItems.length <= 1}>
                <RemoveCircleOutline />
              </IconButton>
            </Box>
          ))}

          <Button size="small" startIcon={<AddCircleOutline />} onClick={addLineItem} sx={{ mt: 1 }}>Add Line Item</Button>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'right' }}>
            <Typography>Subtotal: ${calcSubtotal().toFixed(2)}</Typography>
            <Typography>Tax: ${(parseFloat(form.tax) || 0).toFixed(2)}</Typography>
            <Typography variant="h6" fontWeight={700}>Total: ${(calcSubtotal() + (parseFloat(form.tax) || 0)).toFixed(2)}</Typography>
          </Box>

          <TextField fullWidth label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            margin="normal" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={!form.clientId || !form.dueDate || form.lineItems.some((li) => !li.description || !li.rate)}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Invoice?</DialogTitle>
        <DialogContent><Typography>This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
