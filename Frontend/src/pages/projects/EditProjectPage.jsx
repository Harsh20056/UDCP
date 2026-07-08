import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConfig.js';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import ProjectForm from '../../components/projects/ProjectForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export default function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(ENDPOINTS.PROJECT_DETAILS(id));
        const p = res.data.data;
        
        // Transform for form
        setDefaultValues({
          name: p.name,
          description: p.description,
          department: p.department,
          budget: p.budget,
          priority: p.priority,
          startDate: p.startDate,
          endDate: p.endDate,
          locationName: p.locationName,
          lat: p.coordinates[0],
          lng: p.coordinates[1]
        });
      } catch (err) {
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...data,
        coordinates: [data.lat, data.lng]
      };
      
      await axiosInstance.put(ENDPOINTS.PROJECT_DETAILS(id), payload);
      navigate(ROUTES.PROJECT_DETAILS(id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Edit Project" 
        subtitle={`Update details for ${defaultValues?.name || id}`} 
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Projects', path: ROUTES.PROJECTS },
          { label: id, path: ROUTES.PROJECT_DETAILS(id) },
          { label: 'Edit' }
        ]}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {defaultValues && (
        <ProjectForm 
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          onCancel={() => navigate(ROUTES.PROJECT_DETAILS(id))}
        />
      )}
    </div>
  );
}
