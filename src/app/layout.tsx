import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "律案助理 - 律师私人案件助理",
  description: "帮助律师把案件素材自动整理成时间线、待办清单和关键日期提醒",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Navbar />
        <div className="max-w-content mx-auto min-h-[calc(100vh-56px)]">
          {children}
        </div>
      </body>
    </html>
  );
}
