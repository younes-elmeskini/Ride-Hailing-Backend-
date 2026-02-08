import prisma from "../../../utils/client";

export function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // km
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  export function calculatePrice(distance: number): number {
    const baseFare = 5; // base price
    const perKm = 2; // per km
    return baseFare + distance * perKm;
  }

  /** ETA in minutes, assuming ~30 km/h average speed */
  export function estimateEtaMinutes(distanceKm: number): number {
    const avgSpeedKmh = 30;
    return Math.round((distanceKm / avgSpeedKmh) * 60);
  }
  
  export async function checkRateLimit(riderId: string): Promise<boolean> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
  
    const count = await prisma.ride.count({
      where: {
        riderId,
        createdAt: {
          gte: tenMinutesAgo, // rides created in last 10 min
        },
      },
    });
  
    return count < 3; // true → allowed, false → exceeded
  }
  