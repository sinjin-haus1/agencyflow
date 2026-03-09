'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, TextField, Button, Box, Paper, Alert } from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                token
                user { id email name }
              }
            }
          `,
          variables: { email, password },
        }),
      });

      const data = await res.json();
      
      if (data.errors) {
        setError(data.errors[0].message);
        return;
      }

      localStorage.setItem('token', data.data.login.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Login
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account? <Link href="/register">Register</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
