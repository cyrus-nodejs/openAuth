import Link from 'next/link';

import {
  AuthShell,
} from '@/modules/auth/components/auth-shell';

import {
  RecoveryForm,
} from '@/modules/auth/components/recovery-form';

export default function RecoveryPage() {
  return (
    <AuthShell
      title="Recover your account"
      description="Verify ownership using an email code or one of your recovery codes."
      footer={
        <div className="text-center text-sm text-slate-500">
          Remembered your credentials?{' '}
          <Link
            href="/login"
            className="font-medium text-slate-950 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      }
    >
      <RecoveryForm />
    </AuthShell>
  );
}