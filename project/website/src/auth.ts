import { SvelteKitAuth } from "@auth/sveltekit";
import Discord from "@auth/sveltekit/providers/discord";

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken: string | null;
  }
}

declare module "@auth/sveltekit" {
  interface Session {
    accessToken: string;
  }
}

/**
 * Request the user's email and guilds.
 */
const scope = "identify email guilds";

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Discord({
      authorization: { params: { scope } },
    }),
  ],
  callbacks: {
    jwt: ({ token, account }) => {
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
});
