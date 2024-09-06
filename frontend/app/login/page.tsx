"use client";
import { signIn, useSession } from "next-auth/react";
import {
  IconGitHub,
  IconGoogle,
  IconEva
} from '@/components/ui/icons'
import { redirect } from "next/navigation";

export default function Login() {
  const { data: session, status } = useSession();
  if (status === "authenticated") {
    redirect("/");
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col justify-evenly max-md:w-80 space-y-8 p-8 bg-neutral-600 text-white dark:bg-white dark:text-[#333333] rounded-xl shadow-lg">
        <div className="flex flex-row items-center justify-start">
          <IconEva className="md:h-20 md:w-20 h-10 w-10" />
          <h2 className="ml-2 text-4xl md:text-7xl font-bold" style={{ fontFamily: 'Lato' }}>Eva</h2>
        </div>
        {/* <div className="max-w-lg mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold">Welcome to <span className="font-extrabold">Eva</span></h2>
          
          <p className="italic mt-4">Your Personal Assistant in Every Conversation</p>
          
          <p className="mt-6 text-gray-700">
            Sign in to unlock a smarter, more personalized experience. Whether you're here to ask questions, get recommendations, or simply chat, <span className="font-bold">Eva</span> is ready to assist you.
          </p>
          
          <h3 className="text-xl font-semibold mt-8">Why Sign In?</h3>
          
          <ul className="mt-4 text-left list-disc list-inside space-y-2">
            <li><span className="font-semibold">Personalized Interactions:</span> Your preferences and history help tailor conversations to your needs.</li>
            <li><span className="font-semibold">Seamless Continuity:</span> Start a conversation on one device and pick it up right where you left off on another.</li>
            <li><span className="font-semibold">Secure and Private:</span> We respect your privacy. Your data is protected with industry-leading encryption.</li>
          </ul>
        </div> */}

        <div className="flex flex-row justify-end">
          <h5 className="mr-4 pt-2 text-lg">Sign in </h5>
          <button
            onClick={() => signIn("google")}
            className="pl-2 pr-2 w-fit flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-white hover:text-black dark:text-black dark:bg-slate-200 dark:hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <IconGoogle className="h-6 w-6" />
          </button>
          <button
            onClick={() => signIn("github")}
            className="ml-2 pl-2 pr-2 w-fit flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-white hover:text-black dark:text-black dark:bg-slate-200 dark:hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <IconGitHub className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
