// backend/pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import clientPromise from "../../../lib/mongodb";
import { createAssistant } from "../../../lib/openai";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly"
        }
      }
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log("SignIn callback triggered for:", user.email);
        
        const client = await clientPromise;
        const db = client.db("app");
        const users = db.collection("users");

        const existing = await users.findOne({ email: user.email });
        if (!existing) {
          console.log("Creating new user and assistant for:", user.email);
          
          // Create assistant with error handling
          let assistantId = null;
          try {
            const assistant = await createAssistant();
            assistantId = assistant.id;
            console.log("Created assistant:", assistantId);
          } catch (error) {
            console.error("Failed to create assistant:", error);
            // Continue without assistant - don't fail the signin
          }

          await users.insertOne({
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            email: user.email,
            provider: account?.provider,
            googleAccessToken: account?.access_token || null,
            openaiAssistantId: assistantId,
            createdAt: new Date()
          });
          console.log("User created successfully");
        } else {
          console.log("User already exists:", user.email);
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        // Return false to prevent signin on error, or true to allow it
        return true; // Allow signin even if database operations fail
      }
    }
  },
  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
});
