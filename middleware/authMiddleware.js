import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_hirewave_jwt_key_12345');

      // Get user from database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Recruiter (Admin role) validation middleware
export const recruiter = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Recruiter credentials required' });
  }
};
export { recruiter as admin }; // Aliased backup
