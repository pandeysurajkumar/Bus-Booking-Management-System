const { z } = require('zod');
const { ROLES } = require('../config/constants');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.CUSTOMER, ROLES.OPERATOR, ROLES.ADMIN]).optional().default(ROLES.CUSTOMER),
  phone: z.string().optional().default('')
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};
