import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '../../api/auth/client/firebase';
import { loginWithFirebase } from '../../api/auth/client/login';
import { firebaseErrorMessage } from './firebaseErrors';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      await loginWithFirebase();
      navigate('/', { replace: true });
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-md bg-white p-8 shadow">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Create account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="rounded-sm border border-gray-300 px-2 py-1.5 text-base text-gray-900 focus:outline-1 focus:-outline-offset-1 focus:outline-gray-500 sm:text-sm/6"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className="rounded-sm border border-gray-300 px-2 py-1.5 text-base text-gray-900 focus:outline-1 focus:-outline-offset-1 focus:outline-gray-500 sm:text-sm/6"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-sm bg-blue-500 px-3 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
