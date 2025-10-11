import NextAuth from "next-auth"

export type UserRole = "ADMIN" | "TEACHER" | "PARENT" | "STUDENT"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: UserRole
      image?: string
    }
  }

  interface User {
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
  }
}