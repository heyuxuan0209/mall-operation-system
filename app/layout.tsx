import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import WelcomeBanner from "@/components/demo/WelcomeBanner";
import DemoFooter from "@/components/demo/DemoFooter";
import DemoWatermark from "@/components/demo/DemoWatermark";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "商户智运Agent - AI驱动的商户健康管理系统",
  description: "AI驱动的商业地产商户运营管理系统 | 个人作品集项目，展示AI产品设计与全栈开发能力 | Next.js + React + TypeScript",
  keywords: "商户运营,AI诊断,健康度监控,智能巡检,商业地产,作品集",
  authors: [{ name: "Heyuxuan" }],
  creator: "Heyuxuan",
  publisher: "Heyuxuan",
  robots: "index, follow",
  openGraph: {
    title: "商户智运Agent - AI驱动的商户健康管理系统",
    description: "AI驱动的商业地产商户运营管理系统 | 个人作品集项目",
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
      <body className={`${inter.variable} antialiased bg-slate-50`}>
        {/* Demo版本欢迎横幅 */}
        <WelcomeBanner />

        {/* Demo版本右下角水印 */}
        <DemoWatermark />

        {/* 主要内容区域 */}
        <div className="flex flex-col min-h-screen">
          <MainLayout>{children}</MainLayout>
          {/* Demo版本页脚 */}
          <DemoFooter />
        </div>
      </body>
    </html>
  );
}
