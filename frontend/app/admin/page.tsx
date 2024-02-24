"use client";

import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Admin() {
  const { data: session } = useSession();
  if (session === null) {
    redirect("/login");
  }

  return (
    <div>
      <p>
        This is admin page - private route. If user is already logged, stay in
        this page, if not, return to login page
      </p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}