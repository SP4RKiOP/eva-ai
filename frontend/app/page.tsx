"use client"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Chat from '@/components/chat';
import {ChatService} from '../lib/service'; 
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [fstNam, lstNam] = session?.user?.name?.split(' ') ?? ['', ''];
  const userMail = session?.user?.email ?? '';
  const userImage = session?.user?.image ?? '';
  const router = useRouter();
  const chatService = new ChatService();
  
  useEffect(() => {
    if (status === 'unauthenticated' || !session) {
      router.push('/login');
    }
  }, [status, session]); // Depend on status and session to trigger effect when they change

  if (status === 'loading') {
    return null; // Prevent rendering until session status is determined
  }

  return (
    <div>
      <Chat fName={fstNam} lName={lstNam} uMail={userMail} uImg={userImage} rtr={router} chatService={chatService}/>
    </div>
  );
}
