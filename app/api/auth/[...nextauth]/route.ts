import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

const prisma = new PrismaClient();

const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null; // Early return if no credentials
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        });

        if (user) {
          const passCorrect = await compare(
            credentials.password,
            user.password
          );
          if (passCorrect) {
            // Return user object with the expected type
            return { id: user.id, email: user.email }; // Ensure to return only the necessary properties
          } else {
            return null; // Incorrect password
          }
        }

        return null; // User not found
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
};

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
