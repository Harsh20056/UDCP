import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConfig.js';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import ProjectForm from '../../components/projects/ProjectForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // If user is from a specific department, default to it
  const defaultValues = {
    name: '',
    description: '',
    department: user?.department || '',
    budget: 0,
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    locationName: '',
    lat: 23.2599,
    lng: 77.4126
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      // Transform data to match backend API format
      const payload = {
        name: data.name,
        description: data.description,
        department: data.department,
        budget: data.budget,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        location: {
          lat: data.lat,
          lng: data.lng,
          address: data.locationName,
          roadName: data.locationName, // Using locationName for both address and roadName
        }
      };
      
      const res = await axiosInstance.post(ENDPOINTS.PROJECTS, payload);
      const newProject = res.data;
      navigate(ROUTES.PROJECT_DETAILS(newProject.id));
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create project');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Create New Initiative" 
        subtitle="Submit a new infrastructure project for cross-departmental coordination." 
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Projects', path: ROUTES.PROJECTS },
          { label: 'New' }
        ]}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <ProjectForm 
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        onCancel={() => navigate(ROUTES.PROJECTS)}
      />
    </div>
  );
}
