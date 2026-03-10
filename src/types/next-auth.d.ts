import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string        // ✅ لازم يكون موجود
    }
  }

  interface User {
    id: string
    role: string          // ✅ لازم يكون موجود
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string          // ✅ لازم يكون موجود
  }
}