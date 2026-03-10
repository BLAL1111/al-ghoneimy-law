import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash("123456", 10)
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashed,
      name: "مدير النظام",
      role: "ADMIN",
    },
  })
  console.log("تم إنشاء المستخدم:", user)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())