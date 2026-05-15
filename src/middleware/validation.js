export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || !email || !password) {
    errors.push("Please fill in all fields");
  }

  if (name.length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    errors.push("Valid email is required");
  }

  if ( password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};


export const validateService = (req,res,next)=>{
    const {serviceName,description} =req.body;
    const errors = [];

      if (!serviceName || serviceName.length < 3) {
        errors.push("Service name must be at least 3 characters");
      }

      if (!description || description.length < 10) {
        errors.push("Description must be at least 10 characters");
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      next();

}

// middleware/validation.js - Add this
export const validatePassword = (req, res, next) => {
  const { password } = req.body;
  const errors = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};