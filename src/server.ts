import app from "./app";

// Start cron job for driver matching (expired offers → next driver)
import "./modules/rider/jobs/driverMatching.cron";

const PORT = process.env.PORT || 7600;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
