import React from 'react';
import V4Layout from '@/components/v4/V4Layout';

export const metadata = {
  title: '商户智运Agent v4 · AI 经营决策中枢',
  description: '面向商场运营方的 AI 经营决策中枢',
};

export default function V4RootLayout({ children }: { children: React.ReactNode }) {
  return <V4Layout>{children}</V4Layout>;
}
