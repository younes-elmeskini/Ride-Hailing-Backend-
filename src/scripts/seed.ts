import "dotenv/config";
import prisma from "../utils/client";
import * as argon2 from "argon2";

const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 };

const DRIVERS_NEAR_PARIS = [
  { fullName: "Jean Dupont", email: "jean.driver@test.com", lat: 48.855, lng: 2.348 },
  { fullName: "Marie Martin", email: "marie.driver@test.com", lat: 48.858, lng: 2.355 },
  { fullName: "Pierre Bernard", email: "pierre.driver@test.com", lat: 48.853, lng: 2.352 },
  { fullName: "Sophie Petit", email: "sophie.driver@test.com", lat: 48.860, lng: 2.340 },
  { fullName: "Lucas Moreau", email: "lucas.driver@test.com", lat: 48.852, lng: 2.360 },
];

const SEED_PASSWORD = "Driver123!";

async function seed() {
  const hashedPassword = await argon2.hash(SEED_PASSWORD);

  for (const d of DRIVERS_NEAR_PARIS) {
    await prisma.driver.upsert({
      where: { email: d.email },
      create: {
        fullName: d.fullName,
        email: d.email,
        password: hashedPassword,
        lat: d.lat,
        lng: d.lng,
        status: "AVAILABLE",
      },
      update: {
        lat: d.lat,
        lng: d.lng,
        status: "AVAILABLE",
      },
    });
    console.log(`Driver seeded: ${d.email} (${d.lat}, ${d.lng})`);
  }

  console.log(`\nSeed done: ${DRIVERS_NEAR_PARIS.length} drivers near Paris (${PARIS_CENTER.lat}, ${PARIS_CENTER.lng}).`);
  console.log(`Login with any driver email + password: ${SEED_PASSWORD}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
