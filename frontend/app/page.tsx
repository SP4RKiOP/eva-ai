"use client"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Chat from '@/components/chat';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [fstNam, lstNam] = session?.user?.name?.split(' ') ?? ['', ''];
  const userMail = session?.user?.email ?? '';
  const userImage = session?.user?.image ?? '';
  const router = useRouter();
  // Redirect if session is null
  if (status === 'unauthenticated' || !session) {
    router.push('/login');
    return null; // Return null to prevent rendering Chat component
  }

  return (
    <div>
      <Chat fName={fstNam} lName={lstNam} uMail={userMail} uImg={userImage}/>
    </div>
  );
}
