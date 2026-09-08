'use client';

import {
  useState,
} from 'react';

import Link from 'next/link';

import {
  AuthShell,
} from '@/modules/auth/components/auth-shell';

import {
  SignupForm,
} from '@/modules/auth/components/signup-form';

import {
  OtpVerification,
} from '@/modules/auth/components/otp-verification';

export default function SignupPage() {
  const [
    email,
    setEmail,
  ] = useState<string>();

  return (
    <AuthShell
      title={
        email
          ? 'Verify your email'
          : 'Create your account'
      }
      description={
        email
          ? `Complete verification for ${email}.`
          : 'Get secure, passwordless access in under a minute.'
      }
      footer={
        <div className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-slate-950 hover:underline"
          >
            Sign in
          </Link>
        </div>
      }
    >
      {email ? (
        <OtpVerification
          email={email}
          onBack={() =>
            setEmail(undefined)
          }
        />
      ) : (
        <SignupForm
          onSubmitted={setEmail}
        />
      )}
    </AuthShell>
  );
}