import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID, // Your GitHub client ID
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // Your GitHub client secret
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store the GitHub profile data in the JWT token after successful login
      if (account && profile) {
        token.id = profile.id;
        token.name = profile.name;
        token.email = profile.email;
        token.avatar = profile.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Make sure the session includes the profile info
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.avatar = token.avatar;
      return session;
    },
  },
};

export default NextAuth(authOptions);
