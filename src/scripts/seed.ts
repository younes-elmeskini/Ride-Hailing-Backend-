import "dotenv/config";
import prisma from "../utils/client";
import * as argon2 from "argon2";
import {
  RideEventType,
  StatusDriver,
  StatusDriverOffer,
  StatusRide,
} from "@prisma/client";

type DriverSeed = {
  fullName: string;
  email: string;
  lat: number;
  lng: number;
  status: StatusDriver;
};

type PersonSeed = {
  fullName: string;
  email: string;
};

type RideEventSeed = {
  id: string;
  type: RideEventType;
  createdAt: Date;
  payload?: Record<string, unknown>;
};

type RideSeed = {
  id: string;
  riderEmail: string;
  driverEmail?: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  distance: number;
  price: number;
  duration: number;
  status: StatusRide;
  startDate?: Date;
  endDate?: Date;
  driverOffer?: {
    id: string;
    driverEmail: string;
    status: StatusDriverOffer;
    expiresAt: Date;
  };
  events: RideEventSeed[];
};

const DEMO_PASSWORD = "MobilsDemo123!";
const FUTURE_PENDING_EXPIRATION = new Date(Date.now() + 5 * 60 * 1000);

const ADMINS: PersonSeed[] = [
  { fullName: "Central Dispatcher", email: "dispatcher@ride.test" },
  { fullName: "City Ops", email: "ops@ride.test" },
];

const RIDERS: PersonSeed[] = [
  { fullName: "Lina Haddad", email: "lina.rider@test.com" },
  { fullName: "Youssef Karim", email: "youssef.rider@test.com" },
  { fullName: "Amal Othmani", email: "amal.rider@test.com" },
];

const DRIVERS_NEAR_PARIS: DriverSeed[] = [
  { fullName: "Jean Dupont", email: "jean.driver@test.com", lat: 48.855, lng: 2.348, status: "AVAILABLE" },
  { fullName: "Marie Martin", email: "marie.driver@test.com", lat: 48.858, lng: 2.355, status: "BUSY" },
  { fullName: "Pierre Bernard", email: "pierre.driver@test.com", lat: 48.853, lng: 2.352, status: "AVAILABLE" },
  { fullName: "Sophie Petit", email: "sophie.driver@test.com", lat: 48.86, lng: 2.34, status: "AVAILABLE" },
  { fullName: "Lucas Moreau", email: "lucas.driver@test.com", lat: 48.852, lng: 2.36, status: "OFFLINE" },
];

const RIDE_SEEDS: RideSeed[] = [
  {
    id: "66f2c3c1af000000000000a1",
    riderEmail: "lina.rider@test.com",
    driverEmail: "jean.driver@test.com",
    startLat: 48.8571,
    startLng: 2.347,
    endLat: 48.866,
    endLng: 2.33,
    distance: 6.4,
    price: 13.8,
    duration: 22,
    status: "COMPLETED",
    startDate: new Date("2026-03-20T07:45:00.000Z"),
    endDate: new Date("2026-03-20T08:07:00.000Z"),
    driverOffer: {
      id: "66f2c3c1af000000000000b1",
      driverEmail: "jean.driver@test.com",
      status: "ACCEPTED",
      expiresAt: new Date("2026-03-20T07:40:00.000Z"),
    },
    events: [
      { id: "66f2c3c1af000000000000c1", type: "REQUESTED", createdAt: new Date("2026-03-20T07:38:00.000Z") },
      { id: "66f2c3c1af000000000000c2", type: "DRIVER_ASSIGNED", createdAt: new Date("2026-03-20T07:40:30.000Z") },
      { id: "66f2c3c1af000000000000c3", type: "ARRIVED", createdAt: new Date("2026-03-20T07:44:30.000Z") },
      { id: "66f2c3c1af000000000000c4", type: "STARTED", createdAt: new Date("2026-03-20T07:45:10.000Z") },
      { id: "66f2c3c1af000000000000c5", type: "COMPLETED", createdAt: new Date("2026-03-20T08:07:10.000Z") },
    ],
  },
  {
    id: "66f2c3c1af000000000000a4",
    riderEmail: "amal.rider@test.com",
    driverEmail: "jean.driver@test.com",
    startLat: 48.8612,
    startLng: 2.342,
    endLat: 48.876,
    endLng: 2.31,
    distance: 10.1,
    price: 21.4,
    duration: 32,
    status: "COMPLETED",
    startDate: new Date("2026-03-19T17:15:00.000Z"),
    endDate: new Date("2026-03-19T17:47:30.000Z"),
    driverOffer: {
      id: "66f2c3c1af000000000000b4",
      driverEmail: "jean.driver@test.com",
      status: "ACCEPTED",
      expiresAt: new Date("2026-03-19T17:10:00.000Z"),
    },
    events: [
      { id: "66f2c3c1af000000000000f1", type: "REQUESTED", createdAt: new Date("2026-03-19T17:08:00.000Z") },
      { id: "66f2c3c1af000000000000f2", type: "DRIVER_ASSIGNED", createdAt: new Date("2026-03-19T17:10:40.000Z") },
      { id: "66f2c3c1af000000000000f3", type: "ARRIVED", createdAt: new Date("2026-03-19T17:14:20.000Z") },
      { id: "66f2c3c1af000000000000f4", type: "STARTED", createdAt: new Date("2026-03-19T17:15:05.000Z") },
      { id: "66f2c3c1af000000000000f5", type: "COMPLETED", createdAt: new Date("2026-03-19T17:47:35.000Z") },
    ],
  },
  {
    id: "66f2c3c1af000000000000a5",
    riderEmail: "lina.rider@test.com",
    driverEmail: "jean.driver@test.com",
    startLat: 48.849,
    startLng: 2.358,
    endLat: 48.838,
    endLng: 2.315,
    distance: 8.6,
    price: 17.6,
    duration: 27,
    status: "ARRIVED",
    startDate: new Date("2026-03-22T09:30:00.000Z"),
    driverOffer: {
      id: "66f2c3c1af000000000000b5",
      driverEmail: "jean.driver@test.com",
      status: "ACCEPTED",
      expiresAt: new Date("2026-03-22T09:25:00.000Z"),
    },
    events: [
      { id: "66f2c3c1af000000000000f6", type: "REQUESTED", createdAt: new Date("2026-03-22T09:23:00.000Z") },
      { id: "66f2c3c1af000000000000f7", type: "DRIVER_ASSIGNED", createdAt: new Date("2026-03-22T09:25:30.000Z") },
      { id: "66f2c3c1af000000000000f8", type: "ARRIVED", createdAt: new Date("2026-03-22T09:29:40.000Z") },
    ],
  },
  {
    id: "66f2c3c1af000000000000a2",
    riderEmail: "youssef.rider@test.com",
    driverEmail: "marie.driver@test.com",
    startLat: 48.8512,
    startLng: 2.3496,
    endLat: 48.844,
    endLng: 2.32,
    distance: 9.1,
    price: 18.7,
    duration: 28,
    status: "ONGOING",
    startDate: new Date("2026-03-21T07:10:00.000Z"),
    driverOffer: {
      id: "66f2c3c1af000000000000b2",
      driverEmail: "marie.driver@test.com",
      status: "ACCEPTED",
      expiresAt: new Date("2026-03-21T07:05:00.000Z"),
    },
    events: [
      { id: "66f2c3c1af000000000000d1", type: "REQUESTED", createdAt: new Date("2026-03-21T07:03:00.000Z") },
      { id: "66f2c3c1af000000000000d2", type: "DRIVER_ASSIGNED", createdAt: new Date("2026-03-21T07:05:30.000Z") },
      { id: "66f2c3c1af000000000000d3", type: "ARRIVED", createdAt: new Date("2026-03-21T07:09:00.000Z") },
      { id: "66f2c3c1af000000000000d4", type: "STARTED", createdAt: new Date("2026-03-21T07:10:05.000Z") },
    ],
  },
  {
    id: "66f2c3c1af000000000000a3",
    riderEmail: "amal.rider@test.com",
    startLat: 48.862,
    startLng: 2.355,
    endLat: 48.871,
    endLng: 2.295,
    distance: 7.3,
    price: 15.2,
    duration: 24,
    status: "MATCHING",
    driverOffer: {
      id: "66f2c3c1af000000000000b3",
      driverEmail: "pierre.driver@test.com",
      status: "PENDING",
      expiresAt: FUTURE_PENDING_EXPIRATION,
    },
    events: [
      { id: "66f2c3c1af000000000000e1", type: "REQUESTED", createdAt: new Date() },
    ],
  },
];

async function seed(): Promise<void> {
  console.log("Seeding ride-hailing demo data...\n");
  const passwordHash = await argon2.hash(DEMO_PASSWORD);

  const [admins, riders, drivers] = await Promise.all([
    Promise.all(
      ADMINS.map((admin) =>
        prisma.admin.upsert({
          where: { email: admin.email },
          create: { ...admin, password: passwordHash },
          update: { fullName: admin.fullName, password: passwordHash },
        })
      )
    ),
    Promise.all(
      RIDERS.map((rider) =>
        prisma.rider.upsert({
          where: { email: rider.email },
          create: { ...rider, password: passwordHash },
          update: { fullName: rider.fullName, password: passwordHash },
        })
      )
    ),
    Promise.all(
      DRIVERS_NEAR_PARIS.map((driver) =>
        prisma.driver.upsert({
          where: { email: driver.email },
          create: {
            fullName: driver.fullName,
            email: driver.email,
            password: passwordHash,
            lat: driver.lat,
            lng: driver.lng,
            status: driver.status,
          },
          update: {
            fullName: driver.fullName,
            lat: driver.lat,
            lng: driver.lng,
            status: driver.status,
            password: passwordHash,
          },
        })
      )
    ),
  ]);

  const riderMap = new Map(riders.map((rider) => [rider.email, rider]));
  const driverMap = new Map(drivers.map((driver) => [driver.email, driver]));

  for (const rideSeed of RIDE_SEEDS) {
    const rider = riderMap.get(rideSeed.riderEmail);
    if (!rider) {
      console.warn(`Skipping ride ${rideSeed.id}: rider ${rideSeed.riderEmail} not found`);
      continue;
    }

    const rideDriver = rideSeed.driverEmail
      ? driverMap.get(rideSeed.driverEmail)
      : undefined;

    const rideRecord = await prisma.ride.upsert({
      where: { id: rideSeed.id },
      create: {
        id: rideSeed.id,
        riderId: rider.id,
        driverId: rideDriver?.id ?? null,
        startLat: rideSeed.startLat,
        startLng: rideSeed.startLng,
        endLat: rideSeed.endLat,
        endLng: rideSeed.endLng,
        distance: rideSeed.distance,
        price: rideSeed.price,
        duration: rideSeed.duration,
        status: rideSeed.status,
        startDate: rideSeed.startDate,
        endDate: rideSeed.endDate,
      },
      update: {
        riderId: rider.id,
        driverId: rideDriver?.id ?? null,
        startLat: rideSeed.startLat,
        startLng: rideSeed.startLng,
        endLat: rideSeed.endLat,
        endLng: rideSeed.endLng,
        distance: rideSeed.distance,
        price: rideSeed.price,
        duration: rideSeed.duration,
        status: rideSeed.status,
        startDate: rideSeed.startDate,
        endDate: rideSeed.endDate,
      },
    });

    if (rideSeed.driverOffer) {
      const offerDriver = driverMap.get(rideSeed.driverOffer.driverEmail);
      if (!offerDriver) {
        console.warn(
          `Skipping driver offer ${rideSeed.driverOffer.id}: driver ${rideSeed.driverOffer.driverEmail} not found`
        );
      } else {
        await prisma.driverOffer.upsert({
          where: { id: rideSeed.driverOffer.id },
          create: {
            id: rideSeed.driverOffer.id,
            driverId: offerDriver.id,
            rideId: rideRecord.id,
            status: rideSeed.driverOffer.status,
            expiresAt: rideSeed.driverOffer.expiresAt,
          },
          update: {
            driverId: offerDriver.id,
            rideId: rideRecord.id,
            status: rideSeed.driverOffer.status,
            expiresAt: rideSeed.driverOffer.expiresAt,
          },
        });
      }
    }

    await Promise.all(
      rideSeed.events.map((event) =>
        prisma.rideEvent.upsert({
          where: { id: event.id },
          create: {
            id: event.id,
            rideId: rideRecord.id,
            eventType: event.type,
            payload: event.payload ? JSON.stringify(event.payload) : null,
            createdAt: event.createdAt,
          },
          update: {
            rideId: rideRecord.id,
            eventType: event.type,
            payload: event.payload ? JSON.stringify(event.payload) : null,
            createdAt: event.createdAt,
          },
        })
      )
    );
  }

  console.log(`Seed complete: ${drivers.length} drivers, ${riders.length} riders, ${admins.length} admins, ${RIDE_SEEDS.length} rides.`);
  console.log(`Demo credentials → email: <account email>, password: ${DEMO_PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
