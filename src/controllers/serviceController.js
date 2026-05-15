// import Service from "../models/Service.js";
// import User from "../models/User.js";

// export const getAllServices = async (req, res) => {
//   try {
//     console.log("📋 Fetching services...");

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const services = await Service.find()
//       .populate("user", "name email publicId")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await Service.countDocuments();

//     console.log(`✅ Found ${services.length} services`);

//     res.json({
//       page,
//       pages: Math.ceil(total / limit),
//       total,
//       services,
//     });
//   } catch (error) {
//     console.error("❌ getAllServices error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getMyServices = async (req, res) => {
//   try {
//     const services = await Service.find({ user: req.user.id }).sort({
//       createdAt: -1,
//     });

//     res.json({
//       count: services.length,
//       services,
//     });
//   } catch (error) {
//     console.error("❌ getMyServices error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const createService = async (req, res) => {
//   try {
//     const { email, publicId, userId, serviceName, description, status } =
//       req.body;

//     let targetUserId;

//     if (email) {
//       const user = await User.findOne({ email });
//       if (!user) return res.status(404).json({ message: "User not found" });
//       targetUserId = user._id;
//     } else if (publicId) {
//       const user = await User.findOne({ publicId });
//       if (!user) return res.status(404).json({ message: "User not found" });
//       targetUserId = user._id;
//     } else if (userId) {
//       targetUserId = userId;
//     } else {
//       return res.status(400).json({ message: "User identifier required" });
//     }

//     const service = await Service.create({
//       user: targetUserId,
//       serviceName,
//       description,
//       status: status || "pending",
//     });

//     const populatedService = await Service.findById(service._id).populate(
//       "user",
//       "name email publicId",
//     );

//     res.status(201).json({
//       message: "Service created successfully",
//       service: populatedService,
//     });
//   } catch (error) {
//     console.error("❌ createService error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const updateService = async (req, res) => {
//   try {
//     const service = await Service.findById(req.params.id);

//     if (!service) {
//       return res.status(404).json({ message: "Service not found" });
//     }

//     const { serviceName, description, status, adminNote } = req.body;

//     if (serviceName) service.serviceName = serviceName;
//     if (description) service.description = description;
//     if (status) service.status = status;
//     if (adminNote !== undefined) service.adminNote = adminNote;

//     await service.save();

//     const updatedService = await Service.findById(service._id).populate(
//       "user",
//       "name email publicId",
//     );

//     res.json({
//       message: "Service updated successfully",
//       service: updatedService,
//     });
//   } catch (error) {
//     console.error("❌ updateService error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const deleteService = async (req, res) => {
//   try {
//     const service = await Service.findById(req.params.id);

//     if (!service) {
//       return res.status(404).json({ message: "Service not found" });
//     }

//     await Service.findByIdAndDelete(req.params.id);

//     res.json({ message: "Service deleted successfully" });
//   } catch (error) {
//     console.error("❌ deleteService error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const addUserNote = async (req, res) => {
//   try {
//     const { note } = req.body;

//     const service = await Service.findById(req.params.id);

//     if (!service) {
//       return res.status(404).json({ message: "Service not found" });
//     }

//     if (service.user.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     service.userNote = note;
//     await service.save();

//     res.json({ message: "Note added", service });
//   } catch (error) {
//     console.error("❌ addUserNote error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getServicesByUserPublicId = async (req, res) => {
//   try {
//     const user = await User.findOne({ publicId: req.params.publicId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const services = await Service.find({ user: user._id })
//       .populate("user", "name email publicId")
//       .sort({ createdAt: -1 });

//     res.json({
//       user: {
//         name: user.name,
//         email: user.email,
//         publicId: user.publicId,
//       },
//       count: services.length,
//       services,
//     });
//   } catch (error) {
//     console.error("❌ getServicesByUserPublicId error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

import Service from "../models/Service.js";
import User from "../models/User.js";

// @desc    Get services (filtered by creator for admin, all for super-admin)
export const getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter based on role
    let filter = {};
    if (req.user.role === "admin") {
      // Admin sees only services they created
      filter = { createdBy: req.user.id };
    }
    // Super admin sees all services (no filter)

    const services = await Service.find(filter)
      .populate("user", "name email publicId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(filter);

    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      services,
    });
  } catch (error) {
    console.error("❌ getAllServices error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create service (admin can only create for their own users)
export const createService = async (req, res) => {
  try {
    const { email, publicId, userId, serviceName, description, status } = req.body;

    let targetUser;

    // Find the target user
    if (email) {
      targetUser = await User.findOne({ email });
    } else if (publicId) {
      targetUser = await User.findOne({ publicId });
    } else if (userId) {
      targetUser = await User.findById(userId);
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Admin can only create services for users THEY created
    if (req.user.role === "admin") {
      // Check if this user was created by this admin
      if (targetUser.createdBy?.toString() !== req.user.id) {
        return res.status(403).json({ 
          message: "You can only create services for users you created" 
        });
      }
      
      // Admin can only create for 'user' role, not other admins
      if (targetUser.role !== "user") {
        return res.status(403).json({ 
          message: "You can only create services for regular users" 
        });
      }
    }

    const service = await Service.create({
      user: targetUser._id,
      serviceName,
      description,
      status: status || "pending",
      createdBy: req.user.id, // Track who created this service
    });

    const populatedService = await Service.findById(service._id)
      .populate("user", "name email publicId");

    res.status(201).json({
      message: "Service created successfully",
      service: populatedService,
    });
  } catch (error) {
    console.error("❌ createService error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged-in user's services
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("❌ getMyServices error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update service
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Admin can only update their own services
    if (req.user.role === "admin" && service.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { serviceName, description, status, adminNote } = req.body;

    if (serviceName) service.serviceName = serviceName;
    if (description) service.description = description;
    if (status) service.status = status;
    if (adminNote !== undefined) service.adminNote = adminNote;

    await service.save();

    const updatedService = await Service.findById(service._id)
      .populate("user", "name email publicId");

    res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("❌ updateService error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Admin can only delete their own services
    if (req.user.role === "admin" && service.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("❌ deleteService error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    User adds note to their service
export const addUserNote = async (req, res) => {
  try {
    const { note } = req.body;

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Verify ownership
    if (service.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    service.userNote = note;
    await service.save();

    res.json({ message: "Note added", service });
  } catch (error) {
    console.error("❌ addUserNote error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get services by user publicId
export const getServicesByUserPublicId = async (req, res) => {
  try {
    const user = await User.findOne({ publicId: req.params.publicId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let filter = { user: user._id };
    
    // Admin can only see their own services for this user
    if (req.user.role === "admin") {
      filter.createdBy = req.user.id;
    }

    const services = await Service.find(filter)
      .populate("user", "name email publicId")
      .sort({ createdAt: -1 });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        publicId: user.publicId,
      },
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("❌ getServicesByUserPublicId error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};