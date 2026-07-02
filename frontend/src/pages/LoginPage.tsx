import { useState } from 'react';
import { signIn, signUp, confirmSignUp } from '../services/auth';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'confirm'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn({ username: email, password });
      toast.success('Logged in successfully!');
      onLogin();
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp({ username: email, password, options: { userAttributes: { email } } });
      toast.success('Check your email for a verification code!');
      setMode('confirm');
    } catch (err: any) {
      toast.error(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      toast.success('Email verified! Please log in.');
      setMode('login');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-blue-500" />
          <h1 className="mt-4 text-3xl font-bold text-white">AI Security Platform</h1>
          <p className="mt-2 text-gray-400">Enterprise-grade threat detection</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
          {mode === 'confirm' ? (
            <form onSubmit={handleConfirm} className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Verify Email</h2>
              <input
                type="text"
                placeholder="Verification code"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold">
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
              <h2 className="text-xl font-semibold text-white">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold">
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
              <p className="text-center text-gray-400 text-sm">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-blue-400 hover:underline">
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
