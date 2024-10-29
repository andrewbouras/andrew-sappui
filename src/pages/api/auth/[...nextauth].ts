// src/pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
  }
}

if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.JWT_SECRET
) {
  console.error("Missing required environment variables", {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  });
  throw new Error("Missing required environment variables");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log("JWT callback triggered");
      console.log("Token before processing:", token);
      console.log("Account:", account);
      console.log("User:", user);

      if (account) {
        token.accessToken = account.access_token;
        console.log("Access token set from account:", token.accessToken);
      }

      if (user) {
        try {
          const apiUrl =
            process.env.NODE_ENV === "production"
              ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
              : process.env.NEXT_PUBLIC_API_URL_DEV;

          console.log("API URL:", apiUrl);

          const response = await fetch(`${apiUrl}/auth/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // If your backend does not require Authorization header, you can remove it
              // 'Authorization': `Bearer ${token.accessToken}`,
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account?.providerAccountId,
            }),
          });

          console.log("Response from backend:", response);

          if (!response.ok) {
            const errorData = await response.text();
            console.error("Error response from backend:", errorData);
            throw new Error(
              `Failed to fetch user from backend: ${response.statusText}`
            );
          }

          const backendUser = await response.json();
          console.log("Backend user:", backendUser);

          token.id = backendUser._id;
          console.log("Token ID set from backend user:", token.id);
        } catch (error) {
          console.error("Error creating or getting user:", error);
          // Decide how you want to handle the error
          // Option 1: Return the token as is
          // return token;
          // Option 2: Re-throw the error to be caught by NextAuth
          throw error;
        }
      }

      console.log("Access Token in JWT callback before signing:", token.accessToken);

      if (!token.id) {
        console.error("Token ID is not set. Cannot sign JWT.");
        return token;
      }

      const newToken = {
        id: token.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
      };

      console.log("New token before signing:", newToken);

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        throw new Error("JWT_SECRET is not defined");
      }

      const signedToken = jwt.sign(newToken, process.env.JWT_SECRET as string);
      console.log("Signed token:", signedToken);

      token.accessToken = signedToken;

      return token;
    },
    async session({ session, token }) {
      console.log("Session callback triggered");
      console.log("Session before processing:", session);
      console.log("Token:", token);

      session.user = {
        ...session.user,
        id: token.id as string,
        accessToken: token.accessToken || "", // Ensure accessToken is always a string
      };

      console.log("Session after processing:", session);

      return session;
    },
  },
  pages: {
    signIn: "/signIn",
    signOut: "/signOut",
    error: "/error",
  },
  secret: process.env.JWT_SECRET,
  debug: true, // Enable debug mode
};

export default NextAuth(authOptions);
