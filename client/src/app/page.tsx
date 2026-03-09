import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h3" gutterBottom>
          Welcome to AgencyFlow
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Automate your agency workflows with AI-powered solutions.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" component={Link} href="/login">
            Login
          </Button>
          <Button variant="outlined" component={Link} href="/register">
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
