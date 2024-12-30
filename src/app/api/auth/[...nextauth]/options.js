
import axios from "axios";
import GitHubProvider from "next-auth/providers/github";


export const options = {
  providers: [
    GitHubProvider({
      name: "GitHub",
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: { params: { scope: "read:user repo" } },
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user  }) {
      // Persist the OAuth access token to the token right after signin
      console.log(user)
      if (account?.access_token) {
        token.accessToken = account.access_token;
        try {
          const res = await axios.get("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          });
          // Store GitHub username in token
          token.username = res.data.login; // The GitHub username
        } catch (error) {
          console.error("Error fetching GitHub profile:", error);
        }
      }
      return token;
    
      return token;
    },
    async session({ session, token }) {
      // Add access token to the session
      session.accessToken = token.accessToken;
      session.user.username = token.username;
      return session;
    },
  },
};
