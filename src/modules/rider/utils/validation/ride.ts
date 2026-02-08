import { z } from "zod";
export default class RideValidation {
    static createRideSchema = z.object({
        startLat: z.number().min(-90, { message: "Start latitude must be between -90 and 90." }).max(90, { message: "Start latitude must be between -90 and 90." }),
        startLng: z.number().min(-180, { message: "Start longitude must be between -180 and 180." }).max(180, { message: "End longitude must be between -180 and 180." }),
        endLat: z.number().min(-90, { message: "End latitude must be between -90 and 90." }).max(90, { message: "End latitude must be between -90 and 90." }),
        endLng: z.number().min(-180, { message: "End longitude must be between -180 and 180." }).max(180, { message: "End longitude must be between -180 and 180." }),
    });

    static estimateRideSchema = z.object({
        startLat: z.number().min(-90, { message: "Start latitude must be between -90 and 90." }).max(90, { message: "Start latitude must be between -90 and 90." }),
        startLng: z.number().min(-180, { message: "Start longitude must be between -180 and 180." }).max(180, { message: "End longitude must be between -180 and 180." }),
        endLat: z.number().min(-90, { message: "End latitude must be between -90 and 90." }).max(90, { message: "End latitude must be between -90 and 90." }),
        endLng: z.number().min(-180, { message: "End longitude must be between -180 and 180." }).max(180, { message: "End longitude must be between -180 and 180." }),
    });

    static cancelRideSchema = z.object({
        rideId: z.string().min(1, { message: "rideId is required." }),
        reason: z.string().optional(),
    });
}