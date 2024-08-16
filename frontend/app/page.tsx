"use client"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Chat from '@/components/chat';
import {ChatService} from '../lib/service'; 
export default function HomePage() {
  const { data: session, status } = useSession();
  const [fstNam, lstNam] = session?.user?.name?.split(' ') ?? ['', ''];
  const userMail = session?.user?.email ?? '';
  const userImage = session?.user?.image ?? '';
  const router = useRouter();
  // Create an instance of ChatService
  const chatService = new ChatService();
  // Redirect if session is null
  if (status === 'unauthenticated' || !session) {
    router.push('/login');
    return null; // Return null to prevent rendering Chat component
  }

  return (
    <div>
      <Chat fName={fstNam} lName={lstNam} uMail={userMail} uImg={userImage} rtr={router} chatService={chatService}/>
    </div>
  );
}
