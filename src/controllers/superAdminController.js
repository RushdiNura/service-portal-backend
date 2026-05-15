import User from "../models/User.js";
import Service from "../models/Service.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs"
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      publicId: "ADM-" + uuidv4().slice(0, 8).toUpperCase(),
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        publicId: admin.publicId,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// export const getSystemStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const activeUsers = await User.countDocuments({ isDeleted: false });
//     const admins = await User.countDocuments({ role: "admin" });
//     const superAdmins = await User.countDocuments({ role: "super-admin" });
//     const regularUsers = await User.countDocuments({ role: "user" });

//     const totalServices = await Service.countDocuments();
//     const pendingServices = await Service.countDocuments({ status: "pending" });
//     const inProgressServices = await Service.countDocuments({ status: "in-progress" });
//     const completedServices = await Service.countDocuments({ status: "completed" });

//     res.json({
//       users: {
//         total: totalUsers,
//         active: activeUsers,
//         admins,
//         superAdmins,
//         regularUsers,
//       },
//       services: {
//         total: totalServices,
//         pending: pendingServices,
//         inProgress: inProgressServices,
//         completed: completedServices,
//       },
//       systemHealth: {
//         status: "healthy",
//         uptime: process.uptime(),
//         timestamp: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("❌ getSystemStats error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $in: ["user", "admin"] } });
    const activeUsers = await User.countDocuments({ 
      role: { $in: ["user", "admin"] }, 
      isDeleted: false 
    });
    const admins = await User.countDocuments({ role: "admin" });
    const superAdmins = await User.countDocuments({ role: "super-admin" });
    const regularUsers = await User.countDocuments({ role: "user" });

    const totalServices = await Service.countDocuments();
    const pendingServices = await Service.countDocuments({ status: "pending" });
    const inProgressServices = await Service.countDocuments({ status: "in-progress" });
    const completedServices = await Service.countDocuments({ status: "completed" });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        admins,
        superAdmins,
        regularUsers,
      },
      services: {
        total: totalServices,
        pending: pendingServices,
        inProgress: inProgressServices,
        completed: completedServices,
      },
      systemHealth: {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ getSystemStats error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllUsersWithDeleted = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password")
      .sort("-createdAt");

    const stats = {
      total: users.length,
      active: users.filter((u) => !u.isDeleted).length,
      deleted: users.filter((u) => u.isDeleted).length,
    };

    res.json({
      stats,
      users,
    });
  } catch (error) {
    next(error);
  }
};
