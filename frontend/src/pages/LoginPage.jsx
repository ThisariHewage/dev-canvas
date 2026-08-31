import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const { loading, resetAuth } = useAuthStore();
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    // Reset stored auth session when visiting the login page
    resetAuth();

    // Check if user just logged out
    const params = new URLSearchParams(window.location.search);
    if (params.get('logged_out') === 'true') {
      setShowLogoutToast(true);
      const timer = setTimeout(() => setShowLogoutToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [resetAuth]);

  const handleGoogleLogin = () => {
    window.location.href = `${baseURL}/auth/google`;
  };

  const handleAsgardeoLogin = () => {
    window.location.href = `${baseURL}/auth/asgardeo`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-white text-slate-800 font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-l-purple-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-white font-sans overflow-hidden relative">
      {/* Left side - Image Hero (Only visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 p-6 h-full flex-col box-border">
        <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-lg">
          {/* Main Hero Photo */}
          <img
            src="https://images.unsplash.com/photo-1603201667230-bd139210db18?q=80&w=1188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Students collaborating"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark Gradient Overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-end p-12">
            <h2 className="text-white text-5xl font-bold leading-tight mb-4 tracking-tight max-w-lg">
              Showcase Your Tech with Clarity
            </h2>
            <p className="text-slate-200 text-base leading-relaxed max-w-md">
              DevCanvas helps you showcase your innovations, connect with recruiters, and track computing coursework feedback all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between items-center p-8 sm:p-12 md:p-16 box-border">
        {/* Empty placeholder for alignment */}
        <div className="hidden lg:block h-8"></div>

        <div className="w-full max-w-md flex flex-col my-auto">
          {/* Top Logo */}
          <div className="flex items-center gap-2.5 mb-8 justify-center lg:justify-start">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              DevCanvas
            </span>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome to DevCanvas</h1>
            <p className="text-slate-500 text-sm">Please sign in to access your student workspace</p>
          </div>

          {/* Login Actions */}
          <div className="w-full flex flex-col gap-4">
            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 px-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center gap-3 transition-all focus:outline-none cursor-pointer text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Asgardeo Login */}
            <button
              onClick={handleAsgardeoLogin}
              className="w-full py-4 px-6 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center gap-3 transition-all focus:outline-none cursor-pointer text-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4F46E5" />
                <path d="M2 17l10 5 10-5" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12l10 5 10-5" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign in with Asgardeo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center">
          <p className="text-slate-400 text-xs">
            Faculty of Computing &copy; 2026. Need assistance? <a href="#" className="text-purple-600 font-semibold hover:underline">Contact your admin.</a>
          </p>
        </div>
      </div>

      {/* ── Bottom Right Logout Success Notification Toast ── */}
      {showLogoutToast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 bg-white/95 backdrop-blur-md border border-emerald-200 rounded-2xl p-4 shadow-[0_12px_32px_rgba(16,185,129,0.18)] text-slate-800 transition-all duration-300 max-w-xs"
          style={{ animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 font-bold shadow-inner">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 pr-1">
            <span className="text-sm font-extrabold text-slate-900 leading-tight">Successfully Logged Out</span>
            <span className="text-xs text-slate-500 font-medium mt-0.5">You have safely signed out of your account.</span>
          </div>
          <button
            onClick={() => setShowLogoutToast(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
