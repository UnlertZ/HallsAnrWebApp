import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'HallsAnr - เว็บไซต์โปรไฟล์และประวัติการทำงาน (Hall Resume)',
  description: 'เว็บประวัติการศึกษา การทำงาน และการฝึกอบรมของคุณฮอลล์ ออกแบบพร้อม Deploy บน Microsoft Azure Portal พร้อมระบบบันทึกผู้เข้าชม',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
