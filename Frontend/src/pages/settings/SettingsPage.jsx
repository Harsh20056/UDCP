import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Bell, Palette, Group, Check, AlertCircle, X, Shield, Lock, Phone, Mail, Award, CheckSquare 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import axiosInstance from '../../api/axiosInstance.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { ROLES, ROLE_LABELS } from '../../config/constants.js';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Navigation active tab: 'PROFILE', 'NOTIFICATIONS', 'USER_MGMT' (Admin only)
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Success/Error state banners
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // PROFILE Tab States
  const [fullName, setFullName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // NOTIFICATION Tab States
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    inApp: true,
    conflictAlerts: true,
    approvalUpdates: true,
    projectUpdates: true,
  });
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  // USER MANAGEMENT Tab States (Admin only)
  const [pendingUsers, setPendingUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actioningUserId, setActioningUserId] = useState(null);

  // Clear messages after 4 seconds automatically
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  // Load Notification Preferences when tab switches
  useEffect(() => {
    if (activeTab === 'NOTIFICATIONS') {
      const fetchPrefs = async () => {
        try {
          setPrefsLoading(true);
          const res = await axiosInstance.get(ENDPOINTS.NOTIFICATION_PREFS);
          setPrefs(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setPrefsLoading(false);
        }
      };
      fetchPrefs();
    } else if (activeTab === 'USER_MGMT') {
      const fetchPendingUsers = async () => {
        try {
          setUsersLoading(true);
          const res = await axiosInstance.get(ENDPOINTS.USERS_PENDING_STAFF);
          setPendingUsers(res.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setUsersLoading(false);
        }
      };
      fetchPendingUsers();
    }
  }, [activeTab]);

  // Actions: Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setSuccessMsg(null);
    try {
      // Simulate profile server update API call
      updateUser({
        name: fullName,
        phone: phoneNumber,
        designation: designation,
      });
      setSuccessMsg('Profile information updated successfully.');
    } catch (err) {
      setErrorMsg('Failed to save profile changes.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Actions: Save Notification Preferences
  const handleSavePrefs = async () => {
    setPrefsSaving(true);
    setSuccessMsg(null);
    try {
      await axiosInstance.put(ENDPOINTS.NOTIFICATION_PREFS, prefs);
      setSuccessMsg('Notification preferences saved successfully.');
    } catch (err) {
      setErrorMsg('Failed to save preferences.');
    } finally {
      setPrefsSaving(false);
    }
  };

  // Actions: Approve Pending Staff Signup Request
  const handleApproveUser = async (uId) => {
    setActioningUserId(uId);
    setSuccessMsg(null);
    try {
      await axiosInstance.post(ENDPOINTS.USER_APPROVE(uId));
      setPendingUsers(prev => prev.filter(u => u.id !== uId));
      setSuccessMsg('Staff member account approved successfully.');
    } catch (err) {
      setErrorMsg('Failed to approve account request.');
    } finally {
      setActioningUserId(null);
    }
  };

  // Actions: Reject Pending Staff Signup Request
  const handleRejectUser = async (uId) => {
    setActioningUserId(uId);
    setSuccessMsg(null);
    try {
      await axiosInstance.post(ENDPOINTS.USER_REJECT(uId));
      setPendingUsers(prev => prev.filter(u => u.id !== uId));
      setSuccessMsg('Staff member account request rejected.');
    } catch (err) {
      setErrorMsg('Failed to reject account request.');
    } finally {
      setActioningUserId(null);
    }
  };

  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile, notification dispatches, and coordination rules.
        </p>
      </div>

      {/* Toast Alert Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg flex items-center gap-2 text-xs font-semibold"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 text-red-600" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Side Tab Navigation */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-card flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('PROFILE')}
              className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'PROFILE'
                  ? 'bg-slate-50 dark:bg-slate-800/80 text-primary dark:text-primary-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <User className="w-4 h-4" />
              Profile details
            </button>

            <button 
              onClick={() => setActiveTab('NOTIFICATIONS')}
              className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'NOTIFICATIONS'
                  ? 'bg-slate-50 dark:bg-slate-800/80 text-primary dark:text-primary-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>

            {isAdmin && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button 
                  onClick={() => setActiveTab('USER_MGMT')}
                  className={`flex items-center justify-between gap-3 w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all relative ${
                    activeTab === 'USER_MGMT'
                      ? 'bg-slate-50 dark:bg-slate-800/80 text-primary dark:text-primary-400 font-extrabold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Group className="w-4 h-4" />
                    User Approvals
                  </span>
                  <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Admin
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side Content Canvas */}
        <div className="col-span-12 lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card overflow-hidden">
          {/* PROFILE Tab content */}
          {activeTab === 'PROFILE' && (
            <div className="p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Profile Information
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-slate-500">
                  {user?.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-650 dark:text-slate-350">
                      {ROLE_LABELS[user?.role]}
                    </span>
                    {user?.department && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-slate-650 dark:text-slate-350">
                        {user.department}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Timezone: Asia/Kolkata (IST)</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-650 dark:text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-650 dark:text-slate-400">Email Address (Read-only)</label>
                    <input 
                      type="email" 
                      value={user?.email} 
                      readonly 
                      className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-500 cursor-not-allowed outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-650 dark:text-slate-400">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-650 dark:text-slate-400">Designation / Role Title</label>
                    <input 
                      type="text" 
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button 
                    type="submit" 
                    disabled={profileSaving}
                    className="bg-primary text-white text-xs font-semibold py-2 px-6 rounded-lg hover:bg-primary/95 shadow-sm transition-colors"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS Tab content */}
          {activeTab === 'NOTIFICATIONS' && (
            <div className="p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Notification Subscriptions
              </h2>

              {prefsLoading ? (
                <div className="py-12 flex justify-center"><LoadingSpinner /></div>
              ) : (
                <div className="space-y-6">
                  {/* Channels block */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Channels</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={prefs.email}
                          onChange={(e) => setPrefs(prev => ({ ...prev, email: e.target.checked }))}
                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20 cursor-pointer"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Notifications</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive digests, conflict overlap alerts, and approvals summaries.</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={prefs.sms}
                          onChange={(e) => setPrefs(prev => ({ ...prev, sms: e.target.checked }))}
                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20 cursor-pointer"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">SMS Text Dispatch</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Urgent notifications for critical road closures and immediate overlaps.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Rules block */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Subscription Categories</h3>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2.5 border-b border-slate-100 dark:border-slate-850 cursor-pointer">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Spatial Conflict Overlaps</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Immediate dispatches when automated mapping tools detect overlaps.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefs.conflictAlerts}
                          onChange={(e) => setPrefs(prev => ({ ...prev, conflictAlerts: e.target.checked }))}
                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20 cursor-pointer animate-all"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 border-b border-slate-100 dark:border-slate-850 cursor-pointer">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Review &amp; Approval Updates</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Stage progression updates on submitted project files.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefs.approvalUpdates}
                          onChange={(e) => setPrefs(prev => ({ ...prev, approvalUpdates: e.target.checked }))}
                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20 cursor-pointer animate-all"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 cursor-pointer">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">General Project Milestones</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Updates on other departments starting/ending operations on scheduled segment routes.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={prefs.projectUpdates}
                          onChange={(e) => setPrefs(prev => ({ ...prev, projectUpdates: e.target.checked }))}
                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20 cursor-pointer animate-all"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <button 
                      onClick={handleSavePrefs}
                      disabled={prefsSaving}
                      className="bg-primary text-white text-xs font-semibold py-2 px-6 rounded-lg hover:bg-primary/95 shadow-sm transition-colors"
                    >
                      {prefsSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USER MANAGEMENT Tab content */}
          {activeTab === 'USER_MGMT' && isAdmin && (
            <div className="p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Pending Staff Account Requests
              </h2>

              {usersLoading ? (
                <div className="py-12 flex justify-center"><LoadingSpinner /></div>
              ) : pendingUsers.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400 text-sm">No pending registration requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((pUser) => (
                    <div 
                      key={pUser.id}
                      className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {pUser.name}
                          </h4>
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs font-bold">
                            {pUser.department}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-slate-500 dark:text-slate-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {pUser.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {pUser.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {pUser.designation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleRejectUser(pUser.id)}
                          disabled={actioningUserId === pUser.id}
                          className="px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 rounded-lg text-sm font-semibold"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveUser(pUser.id)}
                          disabled={actioningUserId === pUser.id}
                          className="px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-semibold shadow-sm"
                        >
                          Approve Staff
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
