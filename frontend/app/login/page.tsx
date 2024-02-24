"use client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import {
  IconGitHub,
  IconOpenAI
} from '@/components/ui/icons'
import { redirect } from "next/navigation";

export default function Login() {
  const { data: session } = useSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
        <IconOpenAI className="mx-auto h-16 w-16 text-gray-900" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Welcome to GenAI Chat</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to continue</p>
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
