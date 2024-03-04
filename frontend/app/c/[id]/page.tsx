"use client"
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Chat from "@/components/chat";

interface IndexPageProps {
  params: {
     id: string;
  };
 }
 
 export default function IndexPage({params}: IndexPageProps) {
   const { data: session, status } = useSession();
   const router = useRouter();
   // Redirect if session is null
   if (status === 'unauthenticated' || !session) {
      router.push('/login');
      return null;
 }
   return <Chat chatId={params.id} />
 }