"use client";
import Navbar from '@/components/Navbar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}