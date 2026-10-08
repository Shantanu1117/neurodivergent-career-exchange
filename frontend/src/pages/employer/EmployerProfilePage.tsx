import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { Building2, Save, ShieldCheck, Plus, X } from 'lucide-react';

export const EmployerProfilePage: React.FC = () => {
  const { profile, setProfile } = useAuth();
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState(profile?.companyName || '');
  const [industry, setIndustry] = useState(profile?.industry || 'Technology');
  const [companySize, setCompanySize] = useState(profile?.companySize || '50-250 employees');
  const [location, setLocation] = useState(profile?.location || 'Remote / Global');
  const [about, setAbout] = useState(profile?.about || '');
  const [accommodationsOffered, setAccommodationsOffered] = useState<string[]>(
    profile?.accommodationsOffered || [
      'Written task instructions standard',
      'Quiet focus blocks',
      'Camera-optional video calls',
    ]
  );
  const [newAcc, setNewAcc] = useState('');

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName || '');
      setIndustry(profile.industry || 'Technology');
      setCompanySize(profile.companySize || '50-250 employees');
      setLocation(profile.location || 'Remote / Global');
      setAbout(profile.about || '');
      setAccommodationsOffered(profile.accommodationsOffered || []);
    }
  }, [profile]);

  const handleAddAcc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAcc.trim() && !accommodationsOffered.includes(newAcc.trim())) {
      setAccommodationsOffered([...accommodationsOffered, newAcc.trim()]);
      setNewAcc('');
    }
  };

  const handleRemoveAcc = (acc: string) => {
    setAccommodationsOffered(accommodationsOffered.filter((a) => a !== acc));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateEmployerProfile({
        companyName,
        industry,
        companySize,
        location,
        about,
        accommodationsOffered,
      });

      if (res.success) {
        setProfile(res.profile);
        success('Company profile updated successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update employer profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Company Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showcase your organization’s inclusive culture and neuro-affirming benefits.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-card transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Company Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="1-20 employees">1-20 employees</option>
                <option value="20-100 employees">20-100 employees</option>
                <option value="100-500 employees">100-500 employees</option>
                <option value="500+ employees">500+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">About Company</label>
            <textarea
              rows={4}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Standard Accommodations Offered */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Standard Neuro-Inclusive Workplace Adjustments
              </h2>
              <p className="text-xs text-slate-500">
                These adjustments are auto-populated into newly created job postings.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAcc}
              onChange={(e) => setNewAcc(e.target.value)}
              placeholder="e.g. Asynchronous daily standup, Camera-optional meetings"
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddAcc}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2 rounded-xl"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {accommodationsOffered.map((acc) => (
              <span
                key={acc}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-900 border border-teal-200"
              >
                <span>{acc}</span>
                <button type="button" onClick={() => handleRemoveAcc(acc)} className="text-teal-600 hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
