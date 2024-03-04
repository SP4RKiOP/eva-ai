import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";

export const authOptions: AuthOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GG_ID as string,
    //   clientSecret: process.env.GG_SECRET as string,
    // }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      profile(profile: GithubProfile) {
        // Extract first name and last name from the name field
        const [firstName = "", lastName = ""] = (profile.name ?? "").split(" ");
        
        // Construct the data object to be sent to your API
        const userData = {
          emailId: profile.email,
          firstName,
          lastName,
        };
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // Send userData to your API endpoint
        fetch(process.env.NEXT_PUBLIC_BLACKEND_API_URL+"api/Users/UserId", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to send user data to the API");
            }
            return response.text();
          })
          .then((data) => {
            console.log("User ID:", data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };