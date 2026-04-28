import React from 'react';
import V2Layout from '@/components/v2/V2Layout';

export const metadata = {
  title: '商户智运Agent v2 · AI 经营决策中枢',
  description: '面向商场运营方的 AI 经营决策中枢',
};

export default function V2RootLayout({ children }: { children: React.ReactNode }) {
  return <V2Layout>{children}</V2Layout>;
}
