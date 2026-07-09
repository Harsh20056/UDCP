const { z } = require('zod');

const approveUserSchema = z.object({
  comment: z.string().optional(),
});

const rejectUserSchema = z.object({
  comment: z.string().min(5, 'Rejection reason is required'),
});

module.exports = { approveUserSchema, rejectUserSchema };
