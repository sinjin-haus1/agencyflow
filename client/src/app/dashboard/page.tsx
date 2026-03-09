'use client';

import { useQuery } from '@apollo/client';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { People, Folder, AccessTime, Receipt } from '@mui/icons-material';
import { GET_CLIENTS, GET_PROJECTS, GET_TIME_ENTRIES, GET_INVOICES } from '@/graphql/queries';

export default function DashboardPage() {
  const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_PROJECTS);
  const { data: timeData, loading: timeLoading } = useQuery(GET_TIME_ENTRIES);
  const { data: invoicesData, loading: invoicesLoading } = useQuery(GET_INVOICES);

  const stats = [
    { title: 'Clients', count: clientsData?.clients?.length || 0, icon: <People />, color: '#1976d2', loading: clientsLoading },
    { title: 'Projects', count: projectsData?.projects?.length || 0, icon: <Folder />, color: '#2e7d32', loading: projectsLoading },
    { title: 'Time Entries', count: timeData?.timeEntries?.length || 0, icon: <AccessTime />, color: '#ed6c02', loading: timeLoading },
    { title: 'Invoices', count: invoicesData?.invoices?.length || 0, icon: <Receipt />, color: '#9c27b0', loading: invoicesLoading },
  ];

  const totalHours = timeData?.timeEntries?.reduce((acc: number, entry: any) => {
    return acc + (entry.duration || 0);
  }, 0) || 0;

  const pendingInvoices = invoicesData?.invoices?.filter((inv: any) => inv.status === 'PENDING').length || 0;
  const totalRevenue = invoicesData?.invoices?.filter((inv: any) => inv.status === 'PAID').reduce((acc: number, inv: any) => acc + (inv.total || 0), 0) || 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4">
                    {stat.loading ? <CircularProgress size={24} /> : stat.count}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color }}>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Typography variant="body1">
                Total Hours Tracked: <strong>{(totalHours / 60).toFixed(1)}h</strong>
              </Typography>
              <Typography variant="body1">
                Pending Invoices: <strong>{pendingInvoices}</strong>
              </Typography>
              <Typography variant="body1">
                Total Revenue: <strong>${totalRevenue.toFixed(2)}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Add your first client in the Clients tab
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2. Create a project for the client
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Start tracking time on projects
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4. Generate invoices when work is complete
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
