import {
    redirect,
  } from 'next/navigation';
  
  import {
    getServerSession,
  } from '@/lib/auth/server-session';
  
  export default async function ProtectedLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const session =
      await getServerSession();
  
    if (!session.authenticated) {
      redirect('/login');
    }
  
    return (
      <>{children}</>
    );
  }