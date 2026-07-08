import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, CheckCircle, AlertCircle, FileText, Send, HelpCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export default function FeedbackFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetProjectId = searchParams.get('projectId') || '';

  // Options states
  const [publicProjects, setPublicProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Form states
  const [projectId, setProjectId] = useState(targetProjectId);
  const [category, setCategory] = useState('COMPLAINT');
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  
  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load public projects dropdown
  useEffect(() => {
    const fetchDropdownProjects = async () => {
      try {
        setProjectsLoading(true);
        const res = await axiosInstance.get(ENDPOINTS.CITIZEN_PROJECTS);
        setPublicProjects(res.data.data || []);
      } catch (err) {
        console.error('Failed to load projects list for feedback select.', err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchDropdownProjects();
  }, []);

  // Update selection if query param loads later or changes
  useEffect(() => {
    if (targetProjectId) {
      setProjectId(targetProjectId);
    }
  }, [targetProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Feedback details are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await axiosInstance.post(ENDPOINTS.CITIZEN_FEEDBACK, {
        projectId,
        category,
        name: fullName || 'Anonymous Citizen',
        email: emailAddress || null,
        phone: phoneNumber || null,
        message,
      });

      setSubmitted(true);
    } catch (err) {
      setErrorMsg('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-modal mt-10">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200 dark:border-green-900/30">
          <CheckCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">Thank You!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your feedback has been successfully submitted. Municipal coordination officers have been notified to review your note.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => navigate('/citizen')}
            className="w-full bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-primary/95 transition-all shadow"
          >
            Return to Citizen Portal
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setProjectId(targetProjectId);
              setCategory('COMPLAINT');
              setFullName('');
              setEmailAddress('');
              setPhoneNumber('');
              setMessage('');
            }}
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-all border border-slate-200 dark:border-slate-750"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Submit Citizen Feedback
          </h1>
          <p className="text-2xs text-slate-400 mt-0.5">Your input will be shared directly with municipal department leads.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
        {/* Project Selection Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-550 dark:text-slate-450 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Select Target Project (Optional)
          </label>
          
          {projectsLoading ? (
            <div className="py-2 flex justify-start"><LoadingSpinner size="sm" /></div>
          ) : (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-750 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">-- General Portal Feedback (No Project) --</option>
              {publicProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.department}] {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Category selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-550 dark:text-slate-450">
            Feedback Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'COMPLAINT', label: 'Complaint' },
              { key: 'REQUEST', label: 'Inquiry' },
              { key: 'SUGGESTION', label: 'Suggestion' },
              { key: 'PRAISE', label: 'Praise' },
            ].map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`py-2 px-1 text-center font-bold text-2xs rounded-lg border transition-all ${
                  category === cat.key
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650 dark:bg-slate-950 dark:border-slate-850 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info optional fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Full Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Email Address (Optional)</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Phone Number (Optional)</label>
          <input
            type="tel"
            placeholder="e.g. +91-9876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Message / Details */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Comments &amp; Feedback Details (Required)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your inquiry, report layout closure issues, or specify feedback notes..."
            rows={4}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            required
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-primary text-white text-sm font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/95 shadow transition-colors flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </div>
  );
}
