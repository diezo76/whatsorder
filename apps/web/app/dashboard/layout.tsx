'use client';

import { ReactNode } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import OnboardingGuard from '@/components/onboarding/OnboardingGuard';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: DashboardLayoutProps) {
  return (
    <OnboardingGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </OnboardingGuard>
  );
}
