// config/validateEnv.js
const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "NODE_ENV"];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
};
