// src/components/LoginForm.jsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const isSubmitting = useRef(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setError('');
    setMessage('Sending login code...');

    try {
      const response = await loginUser({
        username: formData.username,
        password: formData.password,
      });
      if (!response || !response.username) {
        throw new Error('Invalid response: username missing');
      }
      const redirectUrl = `/verify?username=${encodeURIComponent(response.username)}`;
      router.push(redirectUrl);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setMessage('');
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Log In</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-blue-500 text-sm mb-4">{message}</p>}
        <form onSubmit={handleSubmit} method="POST">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-200"
          >
            Log In
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
