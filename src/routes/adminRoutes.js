import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import { validateRegister } from "../middleware/validation.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
  searchUsers,
  getStats,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(auth); // All routes require authentication
router.use(role("admin", "super-admin")); // All routes require admin or higher

router.post("/users", validateRegister, createUser);
router.delete("/users/:id", deleteUser);
router.get("/users", getAllUsers);
router.get("/users/search", searchUsers);
router.get("/stats", getStats);

export default router;
