'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  // Use VACEI backend URL (same as login, onboarding, and authUtils)
  const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const logout = async () => {
    try {
      await fetch(`${backendUrl}auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // important to send cookies
      });

      // Clear only auth-related items, preserve onboarding data
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
      // Even if logout API fails, clear only auth-related items, preserve onboarding data
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('user_id');
      
      if (typeof document !== 'undefined') {
        document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
        document.cookie = 'client-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure';
      }
      router.push('/login');
    }
  };

  return { isLoggedIn, logout };
}
