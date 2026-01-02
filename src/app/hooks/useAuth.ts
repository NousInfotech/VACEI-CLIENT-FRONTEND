'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const logout = async () => {
    try {
      await fetch(backendUrl + 'auth/logout', {
        method: 'POST',
        credentials: 'include', // important to send cookies
      });

      localStorage.removeItem('token');

      // ✅ Redirect using Next.js router
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return { isLoggedIn, logout };
}
