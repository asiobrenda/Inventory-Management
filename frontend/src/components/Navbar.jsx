// src/components/Navbar.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkAuth, logout } from '@/lib/api';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { isAuthenticated } = await checkAuth();
        setIsAuthenticated(isAuthenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyAuth();

    // Optional: Poll or listen for route changes
    const interval = setInterval(verifyAuth, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          MyApp
        </Link>
        <ul className="flex space-x-6">
          {isAuthenticated ? (
            <>
            <li>
              <a href="/home" className="text-white hover:text-blue-400">
               Home
              </a>
            </li>
            <li>
              <a href="/dashboard" className="text-white hover:text-blue-400">
                Dashboard
              </a>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-white hover:text-blue-400"
              >
                Logout
              </button>
            </li>
          </>

          ) : (
            <>
              <li>
                <Link href="/signup" className="text-white hover:text-blue-400">
                  Signup
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white hover:text-blue-400">
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
