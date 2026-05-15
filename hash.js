import bcrypt from "bcryptjs";

const hash = await bcrypt.hash("Super123!", 10);
console.log("COPY THIS HASH:");
console.log(hash);
