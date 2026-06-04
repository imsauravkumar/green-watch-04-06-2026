import jwt from 'jsonwebtoken';
import { isMockDb, getMockDb } from '../config/db.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'greenwatch_dev_jwt_secret_key_12345_super_secure';
      
      const decoded = jwt.verify(token, secret);

      if (isMockDb) {
        const db = getMockDb();
        const user = db.users.find(u => u.id === decoded.id || u.email === decoded.email);
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found in mock DB' });
        }
        // Exclude password from populated user object
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = user;
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
