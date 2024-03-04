"use client"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Chat from '@/components/chat';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // Redirect if session is null
  if (status === 'unauthenticated' || !session) {
    router.push('/login');
    return null; // Return null to prevent rendering Chat component
  }

  return (
    <div>
      <Chat />
    </div>
  );
}
