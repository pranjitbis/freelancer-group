import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const user = await validateUser(
            credentials.email,
            credentials.password
          );

          if (user) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
          return null;
        } catch (error) {
          console.error("Credentials auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      if (
        account?.provider === "google" &&
        (!token.role || trigger === "signIn")
      ) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id.toString();
          }
        } catch (error) {
          console.error("Error fetching Google user role:", error);
        }
      }

      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      try {
        if (account.provider === "google") {
          const existingUser = await findOrCreateGoogleUser(profile);
          user.role = existingUser.role;
          user.id = existingUser.id.toString();
          return true;
        }

        if (account.provider === "credentials") {
          return true;
        }

        return false;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },

    // ULTRA SIMPLE REDIRECT - FIXED VERSION
    async redirect({ url, baseUrl }) {
      // COMPLETELY IGNORE THE URL PARAMETER
      // ALWAYS return a clean URL to dashboard
      const cleanRedirect = `${baseUrl}/dashboard`;
      return cleanRedirect;
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/login", // Redirect errors to login page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

async function validateUser(email, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error("No user found with this email");
    }

    if (!user.password) {
      throw new Error("Please use Google login for this account");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      return user;
    }

    throw new Error("Invalid password");
  } catch (error) {
    console.error("Validate user error:", error);
    throw error;
  }
}

async function findOrCreateGoogleUser(profile) {
  try {
    let user = await prisma.user.findUnique({
      where: { email: profile.email.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email.toLowerCase(),
          name: profile.name,
          password: "",
          role: "user",
          status: "active",
          avatar: profile.picture,
        },
      });

      await prisma.userProfile.create({
        data: {
          userId: user.id,
          title: "Freelancer",
          bio: "Google user",
          available: true,
        },
      });
    } else {
      if (!user.avatar && profile.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: profile.picture },
        });
      }
    }

    return user;
  } catch (error) {
    console.error("Google user creation error:", error);
    throw error;
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
