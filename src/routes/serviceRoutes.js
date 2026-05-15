import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import { validateService } from "../middleware/validation.js";
import {
  createService,
  updateService,
  deleteService,
  getAllServices,
  getMyServices,
  addUserNote,
  getServicesByUserPublicId,
} from "../controllers/serviceController.js";

const router = express.Router();

// Public routes (require auth)
router.get("/my", auth, getMyServices);
router.put("/:id/note", auth, addUserNote);

// Admin routes
router.post(
  "/",
  auth,
  role("admin", "super-admin"),
  validateService,
  createService,
);
router.put("/:id", auth, role("admin", "super-admin"), updateService);
router.delete("/:id", auth, role("admin", "super-admin"), deleteService);
router.get("/", auth, role("admin", "super-admin"), getAllServices);
router.get(
  "/user/:publicId",
  auth,
  role("admin", "super-admin"),
  getServicesByUserPublicId,
);

export default router;
