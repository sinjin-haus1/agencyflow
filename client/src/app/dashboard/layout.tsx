'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('agencyflow_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return <Layout>{children}</Layout>;
}
