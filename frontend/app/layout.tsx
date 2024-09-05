import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/auth";
import Provider from "./client-provider";
import "./globals.css";
import Chat from "@/components/chat";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "ChatIQ",
  description: "Made by Abhishek Sinha",
  content:"width=device-width, initial-scale=1.0"
};

const inter = Inter({
  subsets: ["latin"],
})

export default async function RootLayout({children,
}: Readonly<{children: React.ReactNode;}>) {
  const session = await getServerSession(authOptions);
  // console.log here to check the session

  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider session={session}>
          <main className="h-dvh">{children}</main>
          <Toaster />
          </Provider>
      </body>
    </html>
  );
}