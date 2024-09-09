import { User, type NextAuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      async profile(profile: GoogleProfile) {
        let back_auth = "";
        let userid = "";
        // Construct the data object to be sent to your API
        const userData = {
          emailId: profile.email,
          firstName: profile.given_name ?? '',
          lastName: profile.family_name ?? '',
          partner: `google-${profile.sub}`,
        };
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // Send userData to your API endpoint
        await fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/UserId`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          
        }).then((response) => {
            if (!response.ok) {
              throw new Error("Failed to send user data to the API");
            }
            back_auth = response.headers.get('authorization') as string;
            return response.text();
          })
          .then((data) => {
            // console.log("User ID on auth:", data as string);
            userid = data as string;
            
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        const user = {
          id: userid,
          name: profile.name ?? profile.email,
          email: profile.email,
          image: profile.picture,
          back_auth
        } as User;

        return user;
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      async profile(profile: GithubProfile) {
        // Extract first name and last name from the name field
        const [firstName = "", lastName = ""] = (profile.name ?? "").split(" ");
        let back_auth = "";
        let userid = "";
        // Construct the data object to be sent to your API
        const userData = {
          emailId: profile.email,
          firstName,
          lastName,
          partner: `github-${profile.id}`,
        };
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // Send userData to your API endpoint
        await fetch(`${process.env.NEXT_PUBLIC_BLACKEND_API_URL}/api/Users/UserId`, {
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
            back_auth = response.headers.get('authorization') as string;
            return response.text();
          })
          .then((data) => {
            // console.log("User ID on auth:", data);
            userid = data as string;
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        const user ={
          id: userid,
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          back_auth
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, trigger, session, user}) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account && (profile?.sub || (profile as any).id)) {
        const id = profile?.sub || (profile as any).id;
        token.provider = `${account.provider}-${id}`;
      }
      if((user as any)?.back_auth && user.id) {
        token.back_auth = (user as any).back_auth;
        token.userid = user.id;
      }
      if (trigger === "update" && session?.back_auth) {
        // Note, that `session` can be any arbitrary object, remember to validate it!
        token.back_auth = session.back_auth;
      }
      return token
    },
    async session({ session, token}) {
      return {
        ...session,
        partner: token.provider,
        userid: token.userid,
        back_auth: token.back_auth,
      };
    },
      }
};