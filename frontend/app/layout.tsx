import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Provider from "./client-provider";
import "./globals.css";
import Chat from "@/components/chat";

export const metadata = {
  title: "ChatIQ",
  description: "Made by Abhishek Sinha",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  // console.log here to check the session

  return (
    <html lang="en">
      <body>
        <Provider session={session}>
          <main className="h-screen">
            {children}
          </main>
          </Provider>
      </body>
    </html>
  );
}