"use client";
import { signIn, useSession } from "next-auth/react";
import {
  IconGitHub,
  IconChatIQ
} from '@/components/ui/icons'
import { redirect } from "next/navigation";

export default function Login() {
  const { data: session, status } = useSession();
  if (status === "authenticated") {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-row items-center justify-center">
          <IconChatIQ className="h-20 w-20" />
          <h2 className="ml-2 text-7xl font-bold" style={{ color: '#333333', fontFamily: 'Lato' }}>ChatIQ</h2>
        </div>
        <button
          onClick={() => signIn("github")}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <IconGitHub className="h-5 w-5 mr-2" /> Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
