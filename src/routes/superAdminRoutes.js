import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createAdmin,
  getSystemStats,
  getAllUsersWithDeleted,
} from "../controllers/superAdminController.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// All routes require super-admin role
router.use(role("super-admin"));

// Super Admin Routes
router.post("/create-admin", createAdmin);
router.get("/stats", getSystemStats);
router.get("/all-users", getAllUsersWithDeleted);

export default router;