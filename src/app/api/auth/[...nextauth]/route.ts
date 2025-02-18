import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { v4 as uuidv4 } from 'uuid';
import { User } from "@/models/Users";
import { Database } from "@/db/Database";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      try{
        Database.getInstance().isInitialized ? console.log("Database is initialized") : await Database.getInstance().initialize();
        const userRepo = Database.getInstance().getRepository(User);
        let existingUser = await userRepo.findOne({ where: { email: user.email } });

      if (!existingUser) {
        const newUser = new User();
        newUser.id = uuidv4();
        newUser.email = user.email;
        newUser.name = user.name;
        newUser.image = user.image;
        existingUser = await userRepo.save(newUser);
      }

      return true;
      }
      catch(e){
        console.log("error", e);
        return false;
      }
        
    },
    async session({ session, token }: { session: any, token: any }) {
      session.user.id = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
