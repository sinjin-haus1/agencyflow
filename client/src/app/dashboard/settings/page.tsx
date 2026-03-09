'use client';

import { useState, useEffect } from 'react';
import {
  Typography, Box, Paper, TextField, Button, Alert, Divider,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { Save, Palette, RestartAlt } from '@mui/icons-material';

const PRESET_COLORS = [
  { label: 'Blue', value: '#1976d2' },
  { label: 'Indigo', value: '#3f51b5' },
  { label: 'Teal', value: '#009688' },
  { label: 'Green', value: '#2e7d32' },
  { label: 'Orange', value: '#ed6c02' },
  { label: 'Red', value: '#d32f2f' },
  { label: 'Purple', value: '#7b1fa2' },
  { label: 'Dark', value: '#212121' },
];

export default function SettingsPage() {
  const [brandName, setBrandName] = useState('AgencyFlow');
  const [brandColor, setBrandColor] = useState('#1976d2');
  const [logoUrl, setLogoUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBrandName(localStorage.getItem('af_brandName') || 'AgencyFlow');
    setBrandColor(localStorage.getItem('af_brandColor') || '#1976d2');
    setLogoUrl(localStorage.getItem('af_logoUrl') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('af_brandName', brandName);
    localStorage.setItem('af_brandColor', brandColor);
    localStorage.setItem('af_logoUrl', logoUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Reload to apply brand changes to layout
    window.location.reload();
  };

  const handleReset = () => {
    setBrandName('AgencyFlow');
    setBrandColor('#1976d2');
    setLogoUrl('');
    localStorage.removeItem('af_brandName');
    localStorage.removeItem('af_brandColor');
    localStorage.removeItem('af_logoUrl');
    window.location.reload();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize your AgencyFlow instance with white-label branding.
      </Typography>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved! Reloading...</Alert>}

      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          <Palette sx={{ mr: 1, verticalAlign: 'middle' }} /> White-Label Branding
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <TextField fullWidth label="Brand Name" value={brandName}
          onChange={(e) => setBrandName(e.target.value)} margin="normal"
          helperText="Displayed in the sidebar and browser title" />

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={500} gutterBottom>Brand Color</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {PRESET_COLORS.map((c) => (
              <Box key={c.value}
                onClick={() => setBrandColor(c.value)}
                sx={{
                  width: 40, height: 40, borderRadius: 1, bgcolor: c.value, cursor: 'pointer',
                  border: brandColor === c.value ? '3px solid' : '2px solid transparent',
                  borderColor: brandColor === c.value ? 'text.primary' : 'transparent',
                  '&:hover': { opacity: 0.8 },
                }}
                title={c.label}
              />
            ))}
          </Box>
          <TextField fullWidth label="Custom Color (hex)" value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)} size="small"
            InputProps={{
              startAdornment: (
                <Box sx={{ width: 24, height: 24, borderRadius: 0.5, bgcolor: brandColor, mr: 1, flexShrink: 0 }} />
              ),
            }} />
        </Box>

        <TextField fullWidth label="Logo URL (optional)" value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)} margin="normal"
          helperText="Enter a URL to your logo image" />

        {logoUrl && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Logo Preview</Typography>
            <img src={logoUrl} alt="Logo preview" style={{ maxHeight: 60, maxWidth: '100%' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button variant="outlined" startIcon={<RestartAlt />} onClick={handleReset} color="inherit">
            Reset to Default
          </Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
