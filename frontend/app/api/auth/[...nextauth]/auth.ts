import { type NextAuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      async profile(profile: GoogleProfile) {
        // Construct the data object to be sent to your API
        const userData = {
          emailId: profile.email,
          firstName: profile.given_name ?? '',
          lastName: profile.family_name ?? '',
          partner: "google",
        };
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // Send userData to your API endpoint
        await fetch(process.env.NEXT_PUBLIC_BLACKEND_API_URL+"/api/Users/UserId", {
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
            console.log("User ID on auth:", data);
            
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        return {
          id: profile.sub,
          name: profile.name ?? profile.email,
          email: profile.email,
          image: profile.picture,
        };
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      async profile(profile: GithubProfile) {
        // Extract first name and last name from the name field
        const [firstName = "", lastName = ""] = (profile.name ?? "").split(" ");
        
        // Construct the data object to be sent to your API
        const userData = {
          emailId: profile.email,
          firstName,
          lastName,
          partner: "github",
        };
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // Send userData to your API endpoint
        await fetch(process.env.NEXT_PUBLIC_BLACKEND_API_URL+"/api/Users/UserId", {
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
            console.log("User ID on auth:", data);
            
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
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token}) {
      return {
        ...session,
        partner: token.provider,
      };
    },
      }
};