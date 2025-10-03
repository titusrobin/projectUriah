// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "../../../lib/mongodb";
import { createAssistant } from "../../../lib/openai";
import { encrypt } from "../../../lib/encryption";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials');
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send"
          ].join(" ")
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("🔐 SignIn callback triggered for:", user.email);
        
        if (!account?.access_token) {
          console.error("❌ No access token received");
          return false;
        }

        const client = await clientPromise;
        const db = client.db("uriah");
        const users = db.collection("users");

        const existingUser = await users.findOne({ email: user.email });

        if (!existingUser) {
          console.log("🆕 Creating new user:", user.email);
          
          let assistantId = null;
          try {
            const assistant = await createAssistant(user.email!);
            assistantId = assistant.id;
            console.log("✅ Assistant created:", assistantId);
          } catch (error) {
            console.error("❌ Failed to create assistant:", error);
          }

          const encryptedToken = encrypt(account.access_token);
          const encryptedRefreshToken = account.refresh_token 
            ? encrypt(account.refresh_token) 
            : null;

          await users.insertOne({
            email: user.email,
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            profileImage: user.image || null,
            provider: account.provider,
            googleAccessToken: encryptedToken,
            googleRefreshToken: encryptedRefreshToken,
            tokenExpiresAt: account.expires_at 
              ? new Date(account.expires_at * 1000) 
              : null,
            openaiAssistantId: assistantId,
            onboardingCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          console.log("✅ User created successfully");
        } else {
          console.log("👤 Existing user logging in:", user.email);
          
          const encryptedToken = encrypt(account.access_token);
          const encryptedRefreshToken = account.refresh_token 
            ? encrypt(account.refresh_token) 
            : null;

          await users.updateOne(
            { email: user.email },
            {
              $set: {
                googleAccessToken: encryptedToken,
                googleRefreshToken: encryptedRefreshToken,
                tokenExpiresAt: account.expires_at 
                  ? new Date(account.expires_at * 1000) 
                  : null,
                updatedAt: new Date()
              }
            }
          );

          console.log("✅ User tokens updated");
        }

        return true;
      } catch (error) {
        console.error("❌ SignIn callback error:", error);
        return false;
      }
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);