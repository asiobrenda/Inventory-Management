// src/components/VerifyCodeForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyCode } from '@/lib/api';

export default function VerifyCodeForm() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username');

  useEffect(() => {
    if (!username) {
      setError('No username provided. Please log in again.');
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [username, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!code) {
      setError('Please enter the login code.');
      setIsLoading(false);
      return;
    }

    try {
      await verifyCode({ username, code });
      setSuccess('Authentication successful!');
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = isLoading
    ? 'w-full p-2 rounded-md text-white bg-blue-300 cursor-not-allowed transition duration-200'
    : 'w-full p-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-200';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Verify Login Code</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        <p className="text-sm text-gray-600 mb-4">
          Enter the 6-digit code sent to your email.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Login Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter 6-digit code"
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className={buttonClass}>
            {isLoading ? 'Submitting...' : 'Submit Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
