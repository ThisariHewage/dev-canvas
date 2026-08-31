import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authService } from '../services/auth.service';

const SelectRolePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If redirected with token, store it first
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
    }
  }, [searchParams, setToken]);

  const handleSubmit = async () => {
    if (!selectedRole) {
      setErrorMsg('Please select a role to continue.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    const res = await authService.selectRole(selectedRole);
    setSubmitting(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 font-sans p-6">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 max-w-2xl w-full shadow-xl shadow-slate-100/50 flex flex-col items-center text-center">
        {/* Top Icon / Header */}
        <div className="flex items-center justify-between w-full mb-6">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            DevCanvas
          </span>
          <button
            onClick={() => authService.logout()}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Choose Your Path
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mb-10 max-w-md leading-relaxed">
          Welcome! To personalize your portal experience, please select your primary account role below.
        </p>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 mb-6 text-sm w-full text-left">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10">
          {/* Student option */}
          <div
            onClick={() => setSelectedRole('STUDENT')}
            className={`border rounded-2xl p-6 sm:p-8 cursor-pointer transition-all text-center flex flex-col items-center group hover:bg-slate-50/50 ${selectedRole === 'STUDENT'
                ? 'bg-purple-50/30 border-purple-500 shadow-lg shadow-purple-500/10'
                : 'border-slate-200'
              }`}
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-slate-900 text-lg font-bold mb-2">Student Creator</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Publish your portfolio projects, receive reviews, and get discovered by employers.
            </p>
          </div>

          {/* Recruiter option */}
          <div
            onClick={() => setSelectedRole('RECRUITER')}
            className={`border rounded-2xl p-6 sm:p-8 cursor-pointer transition-all text-center flex flex-col items-center group hover:bg-slate-50/50 ${selectedRole === 'RECRUITER'
                ? 'bg-purple-50/30 border-purple-500 shadow-lg shadow-purple-500/10'
                : 'border-slate-200'
              }`}
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-slate-900 text-lg font-bold mb-2">Recruiter / Employer</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Search top talent projects, follow creators, and save your favorite project highlights.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold shadow-lg shadow-purple-500/25 transition-all focus:outline-none ${submitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
        >
          {submitting ? 'Setting up your profile...' : 'Continue to DevCanvas'}
        </button>
      </div>
    </div>
  );
};

export default SelectRolePage;
