const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "";
  const password = "";

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("✅ Admin already exists:", existingAdmin.email);
  } else {
    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("🎉 Admin created:", admin.email);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
export async function GET() {
  try {
    const leads = await prisma.WebDev.findMany({
      orderBy: { createdAt: "desc" }, // newest first
    });

    return NextResponse.json({ success: true, leads });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
