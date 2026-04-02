const app = require("./src/app");
const connectDB = require("./src/config/db");
const config = require("./src/config/env");

const startServer = async () => {
  try {
    await connectDB(config.mongoUri);

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.env} mode`);
    });

    const shutdown = () => {
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
