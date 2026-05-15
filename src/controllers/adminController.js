import User from "../models/User.js";

// export const getAllUsers = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const filter = {
//       role: { $ne: "super-admin" },
//       _id: { $ne: req.user.id },
//     };

//     const users = await User.find(filter)
//       .select("-password")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await User.countDocuments(filter);

//     res.json({ page, pages: Math.ceil(total / limit), total, users });
//   } catch (error) {
//     console.error("❌ getAllUsers error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter based on role
    let filter = {};

    if (req.user.role === "super-admin") {
      // Super admin sees ALL admins and users (not themselves, not other super-admins)
      filter = {
        role: { $in: ["user", "admin"] }, // Only users and admins
      };
    } else if (req.user.role === "admin") {
      // Admin sees only users THEY created
      filter = {
        role: "user",              // Only users, not other admins
        createdBy: req.user.id,    // Only created by this admin
      };
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      users,
    });
  } catch (error) {
    console.error("❌ getAllUsers error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const createUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required" });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     if (role === "super-admin") {
//       return res.status(403).json({ message: "Super-admin can only be created in database" });
//     }

//     const allowedRoles = req.user.role === "super-admin" ? ["user", "admin"] : ["user"];
//     const selectedRole = role || "user";

//     if (!allowedRoles.includes(selectedRole)) {
//       return res.status(403).json({ message: `Cannot create role: ${selectedRole}` });
//     }

//     const prefix = selectedRole === "admin" ? "ADM" : "USR";
//     const publicId = `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

//     const user = await User.create({ name, email, password, role: selectedRole, publicId });

//     res.status(201).json({
//       message: `${selectedRole} created successfully`,
//       user: { id: user._id, name: user.name, email: user.email, role: user.role, publicId: user.publicId },
//     });
//   } catch (error) {
//     console.error("❌ createUser error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "super-admin") {
      return res.status(403).json({ message: "Super-admin can only be created in database" });
    }

    // Admin can only create 'user', Super-admin can create 'user' or 'admin'
    const allowedRoles = req.user.role === "super-admin" ? ["user", "admin"] : ["user"];
    const selectedRole = role || "user";

    if (!allowedRoles.includes(selectedRole)) {
      return res.status(403).json({ message: `Cannot create role: ${selectedRole}` });
    }

    const prefix = selectedRole === "admin" ? "ADM" : "USR";
    const publicId = `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    // ✅ Save who created this user
    const user = await User.create({
      name,
      email,
      password,
      role: selectedRole,
      publicId,
      createdBy: req.user.id, // ← Track creator
    });

    res.status(201).json({
      message: `${selectedRole} created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        publicId: user.publicId,
      },
    });
  } catch (error) {
    console.error("❌ createUser error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "super-admin") return res.status(403).json({ message: "Cannot delete super-admin" });

    user.isDeleted = true;
    await user.save();
    res.json({ message: "User deleted", userId: user.publicId });
  } catch (error) {
    console.error("❌ deleteUser error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query required" });

    let filter = {};

    if (req.user.role === "super-admin") {
      filter = {
        role: { $in: ["user", "admin"] },
      };
    } else if (req.user.role === "admin") {
      filter = {
        role: "user",
        createdBy: req.user.id,
      };
    }

    filter.$or = [
      { email: { $regex: query, $options: "i" } },
      { publicId: { $regex: query, $options: "i" } },
      { name: { $regex: query, $options: "i" } },
    ];

    const users = await User.find(filter).select("-password");
    res.json({ count: users.length, users });
  } catch (error) {
    console.error("❌ searchUsers error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const searchUsers = async (req, res) => {
//   try {
//     const { query } = req.query;
//     if (!query) return res.status(400).json({ message: "Search query required" });

//     const filter = {
//       role: { $ne: "super-admin" },
//       _id: { $ne: req.user.id },
//       $or: [
//         { email: { $regex: query, $options: "i" } },
//         { publicId: { $regex: query, $options: "i" } },
//         { name: { $regex: query, $options: "i" } },
//       ],
//     };

//     const users = await User.find(filter).select("-password");
//     res.json({ count: users.length, users });
//   } catch (error) {
//     console.error("❌ searchUsers error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getStats = async (req, res) => {
//   try {
//     const filter = { role: { $ne: "super-admin" } };
//     const totalUsers = await User.countDocuments(filter);
//     const activeUsers = await User.countDocuments({ ...filter, isDeleted: false });
//     const admins = await User.countDocuments({ role: "admin" });
//     const regularUsers = await User.countDocuments({ role: "user" });

//     res.json({ totalUsers, activeUsers, admins, regularUsers });
//   } catch (error) {
//     console.error("❌ getStats error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const getStats = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "super-admin") {
      // Super admin sees all stats
      filter = { role: { $in: ["user", "admin"] } };
    } else if (req.user.role === "admin") {
      // Admin sees only their users
      filter = { role: "user", createdBy: req.user.id };
    }

    const totalUsers = await User.countDocuments(filter);
    const activeUsers = await User.countDocuments({ ...filter, isDeleted: false });
    
    const admins = req.user.role === "super-admin" 
      ? await User.countDocuments({ role: "admin" }) 
      : 0;
    
    const regularUsers = req.user.role === "super-admin"
      ? await User.countDocuments({ role: "user" })
      : await User.countDocuments({ role: "user", createdBy: req.user.id });

    res.json({
      totalUsers,
      activeUsers,
      admins,
      regularUsers,
    });
  } catch (error) {
    console.error("❌ getStats error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};