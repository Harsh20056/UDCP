const { z } = require('zod');
const { ROLE_VALUES, DEPARTMENT_VALUES } = require('../config/constants');

const registerCitizenSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  accountType: z.literal('citizen'),
});

const registerStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  accountType: z.literal('staff'),
  role: z.enum(ROLE_VALUES.filter(r => r !== 'admin')), // staff cannot self-assign admin
  department: z.enum(DEPARTMENT_VALUES),
  phone: z.string().optional(),
});

const registerSchema = z.discriminatedUnion('accountType', [
  registerCitizenSchema,
  registerStaffSchema,
]);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
