import cron from "node-cron";
import prisma from "../../../utils/client";
import { haversineDistance } from "../utils/helperfunctions";

// run every 5 seconds
cron.schedule("*/5 * * * * *", async () => {
  console.log("Checking expired driver offers...");
  const now = new Date();

  // 1️⃣ get expired offers
  const expiredOffers = await prisma.driverOffer.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: now,
      },
    },
    include: {
      ride: true,
      driver: true,
    },
  });

  for (const offer of expiredOffers) {
    const ride = offer.ride;
    if (!ride || ride.status !== "MATCHING") continue;

    // 2️⃣ mark offer rejected
    await prisma.driverOffer.update({
      where: { id: offer.id },
      data: { status: "REJECTED" },
    });

    // 3️⃣ free old driver
    await prisma.driver.update({
      where: { id: offer.driverId },
      data: { status: "AVAILABLE" },
    });

    // 4️⃣ find next nearest driver (excluding previous, with position)
    const drivers = await prisma.driver.findMany({
      where: {
        status: "AVAILABLE",
        id: { not: offer.driverId },
        lat: { not: null },
        lng: { not: null },
      },
    });

    if (!drivers.length) {
      console.log(`❌ No drivers left for ride ${ride.id}`);
      continue;
    }

    let nearestDriver = drivers[0];
    let minDistance = haversineDistance(
      ride.startLat,
      ride.startLng,
      nearestDriver.lat!,
      nearestDriver.lng!
    );

    for (const driver of drivers) {
      const dist = haversineDistance(
        ride.startLat,
        ride.startLng,
        driver.lat!,
        driver.lng!
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestDriver = driver;
      }
    }

    // 5️⃣ create new offer
    await prisma.driverOffer.create({
      data: {
        rideId: ride.id,
        driverId: nearestDriver.id,
        expiresAt: new Date(Date.now() + 60 * 1000),
      },
    });

    console.log(`New offer sent to driver ${nearestDriver.id} for ride ${ride.id}`);
  }
});