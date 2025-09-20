// backend/pages/api/auth/nextauth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import clientPromise from "../../../lib/mongodb";
import { createAssistant } from "../../../lib/openai";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly" } }
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      const client = await clientPromise;
      const db = client.db("app");
      const users = db.collection("users");

      const existing = await users.findOne({ email: user.email });
      if (!existing) {
        const assistant = await createAssistant(); // create OpenAI assistant
        await users.insertOne({
          firstName: user.name?.split(" ")[0] || "",
          lastName: user.name?.split(" ").slice(1).join(" ") || "",
          email: user.email,
          provider: account?.provider,
          googleAccessToken: account?.access_token || null,
          openaiAssistantId: assistant.id,
          createdAt: new Date()
        });
      }
      return true;
    }
  }
});
