import { RiderJwtPayload } from '../modules/rider/middleware/auth';
import { DriverJwtPayload } from '../modules/driver/middleware/auth';
import { AdminJwtPayload } from '../modules/admin/middleware/auth';

declare global {
  namespace Express {
    interface Request {
      rider?: RiderJwtPayload;
      driver?: DriverJwtPayload;
      admin?: AdminJwtPayload
    }
  }
}