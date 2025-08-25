'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'verify' | 'success' | 'error'>('request');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('https://schoozy.in/api/auth/send-otp', { email });

      if (res.data?.message === 'OTP sent') {
        setMessage('OTP sent to your email.');
        setStep('verify');
      } else {
        throw new Error(res.data.message || 'OTP send failed');
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.message || err.message);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const verify = await axios.post('https://schoozy.in/api/auth/verify-otp', { email, otp });

      if (!verify.data.valid) throw new Error('OTP verification failed.');

      const reset = await axios.post('https://schoozy.in/api/auth/forgot-password', {
        email,
        password: newPassword,
      });

      if (reset.data.success) {
        setMessage('Password reset successful!');
        setStep('success');

        setTimeout(() => {
          router.push('/login-account');
        }, 2000);
      } else {
        throw new Error(reset.data.message || 'Reset failed.');
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.message || err.message);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOtp('');
    setNewPassword('');
    setStep('request');
    setMessage('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-950 px-4">
      <Card className="w-full max-w-md space-y-4 p-6 shadow-xl">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            {step === 'request' && 'Enter your email and new password to receive an OTP.'}
            {step === 'verify' && 'Enter the OTP you received to complete the reset.'}
            {step === 'success' && 'Your password has been changed. Redirecting...'}
            {step === 'error' && 'Something went wrong. Try again.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <div
              className={`p-3 rounded text-sm ${
                step === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="relative">
                <Label>New Password</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-colors"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div>
                <Label>OTP</Label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                />
              </div>
              <div className="relative">
                <Label>New Password</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-colors"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Reset'}
              </Button>
              <Button
                className="w-full text-blue-600 hover:text-purple-600 transition-colors"
                variant="outline"
                type="button"
                onClick={resetForm}
                disabled={loading}
              >
                Back
              </Button>
            </form>
          )}

          {step === 'success' && (
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-colors"
              disabled
            >
              Redirecting to Login...
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
