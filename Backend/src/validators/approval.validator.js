const { z } = require('zod');

const approveSchema = z.object({
  comment: z.string().optional(),
});

const rejectSchema = z.object({
  comment: z.string().min(10, 'Rejection must include a detailed reason'),
});

module.exports = { approveSchema, rejectSchema };
