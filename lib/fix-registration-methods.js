const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixRegistrationMethods() {
  try {
    console.log("Starting to fix registration methods...");

    // Get ALL users first
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        registrationMethod: true,
      },
    });

    console.log(`Total users found: ${allUsers.length}`);

    let googleUpdated = 0;
    let emailUpdated = 0;
    let noChange = 0;

    // Process each user individually
    for (const user of allUsers) {
      try {
        let shouldBeGoogle = false;

        // Check if this should be a Google user
        if (
          user.password === "" ||
          user.password === "google_oauth" ||
          !user.password ||
          user.registrationMethod === "google"
        ) {
          shouldBeGoogle = true;
        }

        // Check if the user has a hashed password (email registration)
        const hasHashedPassword =
          user.password &&
          user.password.startsWith("$2") &&
          user.password.length > 20;

        if (hasHashedPassword) {
          shouldBeGoogle = false;
        }

        const correctRegistrationMethod = shouldBeGoogle ? "google" : "email";

        // Only update if different from current
        if (user.registrationMethod !== correctRegistrationMethod) {
          await prisma.user.update({
            where: { id: user.id },
            data: { registrationMethod: correctRegistrationMethod },
          });

          if (correctRegistrationMethod === "google") {
            googleUpdated++;
            console.log(`✅ Updated ${user.email} to Google registration`);
          } else {
            emailUpdated++;
            console.log(`✅ Updated ${user.email} to Email registration`);
          }
        } else {
          noChange++;
          console.log(
            `ℹ️  ${user.email}: Already correct (${user.registrationMethod})`
          );
        }
      } catch (error) {
        console.error(`❌ Failed to update ${user.email}:`, error.message);
      }
    }

    console.log("\n🎉 Fix completed!");
    console.log(`📊 Google registrations updated: ${googleUpdated}`);
    console.log(`📊 Email registrations updated: ${emailUpdated}`);
    console.log(`📊 No changes needed: ${noChange}`);
    console.log(`📊 Total processed: ${allUsers.length}`);
  } catch (error) {
    console.error("Unexpected error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixRegistrationMethods();
