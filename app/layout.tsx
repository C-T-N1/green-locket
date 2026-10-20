import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DynamicIconHandler from "./components/DynamicIconHandler";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Cấu hình Metadata chuẩn PWA cho Next.js App Router
export const metadata: Metadata = {
  title: "Green Locket - Nhật Ký Xanh",
  description: "Ứng dụng chụp ảnh hành động xanh & trồng cây thực tế cùng chú ong xanh 🐝",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/bee-happy-192.png",
    shortcut: "/assets/bee-happy-192.png",
    apple: "/assets/bee-happy-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Green Locket",
  },
};

// Cấu hình Viewport & Màu nền thanh trạng thái trình duyệt / PWA
export const viewport: Viewport = {
  themeColor: "#4d8b76",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#d7ede6] text-slate-800">
        <DynamicIconHandler />
        {children}
      </body>
    </html>
  );
}