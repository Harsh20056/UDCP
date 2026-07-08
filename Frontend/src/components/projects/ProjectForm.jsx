import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { DEPARTMENT_LIST, PRIORITY_CONFIG } from '../../config/constants.js';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  department: z.string().min(1, 'Department is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  priority: z.string().min(1, 'Priority is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  locationName: z.string().min(1, 'Location name is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: "End date cannot be earlier than start date",
  path: ['endDate'],
});

export default function ProjectForm({ defaultValues, onSubmit, isSubmitting, onCancel }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues || {
      name: '', description: '', department: '', budget: 0, priority: 'MEDIUM',
      startDate: '', endDate: '', locationName: '', lat: 23.2599, lng: 77.4126
    }
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
          <input 
            {...register('name')} 
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`} 
            placeholder="e.g. Downtown Fiber Optic Laying"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea 
            {...register('description')} 
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`} 
            placeholder="Detailed description of the project scope..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
          <select 
            {...register('department')}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.department ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`}
          >
            <option value="">Select Department</option>
            {DEPARTMENT_LIST.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
          <select 
            {...register('priority')}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.priority ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`}
          >
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {errors.priority && <p className="mt-1 text-xs text-red-500">{errors.priority.message}</p>}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget ($)</label>
          <input 
            type="number"
            {...register('budget', { valueAsNumber: true })} 
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.budget ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`} 
          />
          {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget.message}</p>}
        </div>

        {/* Location Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location Name</label>
          <input 
            {...register('locationName')} 
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.locationName ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`} 
            placeholder="e.g. MG Road, Sector 4"
          />
          {errors.locationName && <p className="mt-1 text-xs text-red-500">{errors.locationName.message}</p>}
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
          <input 
            type="date"
            {...register('startDate')} 
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.startDate ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`} 
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
          <input 
            type="date"
            {...register('endDate')} 
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.endDate ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`} 
          />
          {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}
        </div>

        {/* Coordinates */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
          <input 
            type="number" step="any"
            {...register('lat', { valueAsNumber: true })} 
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.lat ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`} 
          />
          {errors.lat && <p className="mt-1 text-xs text-red-500">{errors.lat.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
          <input 
            type="number" step="any"
            {...register('lng', { valueAsNumber: true })} 
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.lng ? 'border-red-300 bg-red-50' : 'border-slate-200 dark:border-slate-700'}`} 
          />
          {errors.lng && <p className="mt-1 text-xs text-red-500">{errors.lng.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Project
        </button>
      </div>
    </form>
  );
}
