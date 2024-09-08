"use client"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Chat from "@/components/chat";
import { ChatService } from '@/lib/service';
import {useMemo, useEffect } from 'react';
interface IndexPageProps {
  params: {
     id: string;
  };
 }
 
 export default function IndexPage({params}: IndexPageProps) {
   const { data: session, status } = useSession();
   const [fstNam, lstNam] = session?.user?.name?.split(' ') ?? ['', ''];
   const userMail = session?.user?.email ?? '';
   const userImage = session?.user?.image ?? '';
   const partner = (session as any)?.partner;
   const router = useRouter();
   // Create an instance of ChatService
   const chatService = ChatService.getInstance();
   
   // Redirect if session is null
   useEffect(() => {
    if (status === 'unauthenticated' || !session) {
      router.push('/login');
    }
  }, [status, session, router]); // Depend on status and session to trigger effect when they change

  if (status === 'loading') {
    return null; // Prevent rendering until session status is determined
  }
   return <Chat chatId={params.id} fName={fstNam} lName={lstNam} uMail={userMail} uImg={userImage} partner={partner} chatService={chatService}/>
 }