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
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('user_id');

      // Clear the cookie used by middleware
      if (typeof document !== 'undefined') {
        document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
        document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
      }

      // ✅ Redirect using Next.js router
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if logout API fails, clear local storage and cookie
      localStorage.clear();
      if (typeof document !== 'undefined') {
        document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
        document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
      }
      router.push('/login');
    }
  };

  return { isLoggedIn, logout };
}
