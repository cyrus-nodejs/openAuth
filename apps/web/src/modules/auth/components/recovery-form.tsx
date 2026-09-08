'use client';

import {
  useState,
} from 'react';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  z,
} from 'zod';

import {
  KeyRound,
  Mail,
} from 'lucide-react';

import {
  AuthButton,
} from './auth-button';

import {
  AuthError,
} from './auth-error';

import {
  AuthInput,
} from './auth-input';

import {
  startRecovery,
  verifyRecovery,
} from '../services/auth.service';

const schema = z.object({
  email: z.string().trim().email(
    'Enter a valid email address',
  ),
});

type Values =
  z.infer<typeof schema>;

export function RecoveryForm() {
  const [
    attemptId,
    setAttemptId,
  ] = useState<string>();

  const [
    method,
    setMethod,
  ] = useState<
    'otp' | 'code'
  >('otp');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    value,
    setValue,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState<string>();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const form =
    useForm<Values>({
      resolver:
        zodResolver(schema),
    });

  async function start(
    values: Values,
  ) {
    setError(undefined);
    setLoading(true);

    try {
      const result =
        await startRecovery(
          values.email,
        );

      setEmail(values.email);
      setAttemptId(
        result.recoveryAttemptId,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to start recovery',
      );
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (!attemptId) {
      return;
    }

    if (!value.trim()) {
      setError(
        method === 'otp'
          ? 'Enter your verification code.'
          : 'Enter your recovery code.',
      );
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      await verifyRecovery({
        recoveryAttemptId:
          attemptId,
        ...(method === 'otp'
          ? { otp: value }
          : {
              recoveryCode: value,
            }),
      });

      window.location.assign(
        '/onboarding',
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Recovery verification failed',
      );
    } finally {
      setLoading(false);
    }
  }

  if (attemptId) {
    return (
      <div className="space-y-6">
        <AuthError message={error} />

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-950">
            Recovery started
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {email}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() =>
              setMethod('otp')
            }
            className={`rounded-lg py-2 text-sm font-medium ${
              method === 'otp'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Email code
          </button>

          <button
            type="button"
            onClick={() =>
              setMethod('code')
            }
            className={`rounded-lg py-2 text-sm font-medium ${
              method === 'code'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Recovery code
          </button>
        </div>

        <div className="space-y-4">
          <AuthInput
            id="recovery"
            label={
              method === 'otp'
                ? 'Verification code'
                : 'Recovery code'
            }
            value={value}
            onChange={event =>
              setValue(
                event.target.value,
              )
            }
            autoComplete={
              method === 'otp'
                ? 'one-time-code'
                : 'off'
            }
            placeholder={
              method === 'otp'
                ? '000000'
                : 'XXXX-XXXX-XXXX'
            }
          />

          <AuthButton
            type="button"
            loading={loading}
            onClick={verify}
          >
            <KeyRound className="h-4 w-4" />
            Verify recovery
          </AuthButton>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(
        start,
      )}
      className="space-y-5"
    >
      <AuthError message={error} />

      <AuthInput
        id="email"
        label="Account email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={
          form.formState.errors.email
            ?.message
        }
        {...form.register('email')}
      />

      <AuthButton
        type="submit"
        loading={loading}
      >
        <Mail className="h-4 w-4" />
        Start account recovery
      </AuthButton>
    </form>
  );
}