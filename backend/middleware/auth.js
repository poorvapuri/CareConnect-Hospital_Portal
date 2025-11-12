import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // ✅ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Normalize userId → id for consistency
    const userId = decoded.userId || decoded.id;

    // ✅ Fetch user from DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token: user not found' });
    }

    // ✅ Attach normalized user object
    req.user = {
      id: user.id || user.userId || user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
