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
  const userid = (session as any)?.userid;
  const back_auth = (session as any)?.back_auth;
  const router = useRouter();
  const chatService = useMemo(() => ChatService.getInstance(), []);

  useEffect(() => {
    if (status != 'authenticated' || !session) {
      router.push('/login');
    }
    if(session){
      chatService.userId$.next(userid as string);
    }
  }, [status, session, router]); 
  return (
    <div>
      <Chat fName={fstNam} lName={lstNam} uMail={userMail} uImg={userImage} partner={partner} userid={userid} back_auth={back_auth} chatService={chatService}/>
    </div>
  );
}
