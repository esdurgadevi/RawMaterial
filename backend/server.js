import app from "./app.js";
import sequelize, { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // connect to DB
    await connectDB();

    // sync models
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    // start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
