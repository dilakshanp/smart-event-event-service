import jwt from "jsonwebtoken";
import { validateUserToken } from "../utils/userServiceClient.js";

const authMiddleware = (req, res, next) => {
  // Skip auth during tests
  if (process.env.NODE_ENV === "test") {
    req.user = { id: "user1" };
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const authViaUserService = async (req, res, next) => {
  try {
    // Skip during tests
    if (process.env.NODE_ENV === "test") {
      req.user = { id: "user1", role: "test" };
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 Call User Service
    const result = await validateUserToken(token);

    if (!result.valid) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user info from User Service
    req.user = {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    };

    next();
  } catch (error) {
    console.error(
      "[AUTH MIDDLEWARE] User service validation failed:",
      error.message,
    );

    return res.status(401).json({
      message: "Authentication failed",
    });
  }
};

export default authMiddleware;
