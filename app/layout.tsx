import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import RootChrome from "@/components/layout/RootChrome";

export const metadata: Metadata = {
  title: "Mall Operation Agent - AI 商场运营与门店改善工作台",
  description: "AI 驱动的商场运营研判与门店改善闭环演示，覆盖续约风险识别、专家建议下发、门店任务执行和效果回流。",
  keywords: "商场运营,门店改善,AI Agent,续约风险,经营诊断,商业地产,经营工作台",
  authors: [{ name: "Heyuxuan" }],
  creator: "Heyuxuan",
  publisher: "Heyuxuan",
  robots: "index, follow",
  openGraph: {
    title: "Mall Operation Agent - AI 商场运营与门店改善工作台",
    description: "从商场续约风险研判到门店改善执行回流的 AI 经营工作台演示。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="antialiased bg-slate-50">
        <RootChrome>
          <MainLayout>{children}</MainLayout>
        </RootChrome>
      </body>
    </html>
  );
}
