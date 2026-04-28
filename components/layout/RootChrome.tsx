'use client';

import { usePathname } from 'next/navigation';
import WelcomeBanner from '@/components/demo/WelcomeBanner';
import DemoFooter from '@/components/demo/DemoFooter';
import DemoWatermark from '@/components/demo/DemoWatermark';
import FloatingAssistant from '@/components/ai-assistant/FloatingAssistant';

// Routes that manage their own complete UI — no root chrome
const CLEAN_ROUTES = ['/workspace', '/v4'];

export default function RootChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isClean = CLEAN_ROUTES.some(r => pathname.startsWith(r));

  if (isClean) {
    return <>{children}</>;
  }

  return (
    <>
      <WelcomeBanner />
      <DemoWatermark />
      <FloatingAssistant />
      <div className="flex flex-col min-h-screen">
        {children}
        <DemoFooter />
      </div>
    </>
  );
}
