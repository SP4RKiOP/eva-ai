"use client"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Chat from '@/components/chat';
import {ChatService} from '../lib/service'; 
import { useEffect, useMemo } from 'react';
import React from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [fstNam, lstNam] = session?.user?.name?.split(' ') ?? ['', ''];
  const userMail = session?.user?.email ?? '';
  const userImage = session?.user?.image ?? '';
  const partner = (session as any)?.partner;
  const router = useRouter();
  const chatService = ChatService.getInstance();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (status === 'loading') {
    return null; // Prevent rendering until session status is determined
  }

  return (
    <div>
      <Chat fName={fstNam} lName={lstNam} uMail={userMail} uImg={userImage} partner={partner} chatService={chatService}/>
    </div>
  );
}
