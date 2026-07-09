const { z } = require('zod');
const { DEPARTMENT_VALUES, PRIORITY_VALUES } = require('../config/constants');

const createProjectSchema = z.object({
  name: z.string().min(3).max(200),
  department: z.enum(DEPARTMENT_VALUES),
  description: z.string().min(10),
  budget: z.number().positive(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  priority: z.enum(PRIORITY_VALUES),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
    roadName: z.string().optional(),
  }),
  assignedOfficer: z.string().optional(),
  status: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  department: z.enum(DEPARTMENT_VALUES).optional(),
  description: z.string().min(10).optional(),
  budget: z.number().positive().optional(),
  budgetUtilized: z.number().nonnegative().optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
    roadName: z.string().optional(),
  }).optional(),
  assignedOfficer: z.string().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  status: z.string().optional(),
});

module.exports = { createProjectSchema, updateProjectSchema };
