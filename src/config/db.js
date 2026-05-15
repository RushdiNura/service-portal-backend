import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log(
      "URI:",
      process.env.MONGO_URI?.replace(/\/\/.*@/, "//<credentials>@"),
    ); // Hide credentials

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Test the connection
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("📦 Collections:", collections.map((c) => c.name).join(", "));

    return conn;
  } catch (error) {
    console.error("❌ DB ERROR:", error.message);
    process.exit(1);
  }
};

export default connectDB;
