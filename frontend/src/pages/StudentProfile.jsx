import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getProjects } from '../api/project.api';
import { updateProfile } from '../api/user.api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const StudentProfile = () => {
  const { user, setUser } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    technologies: Array.isArray(user?.technologies) ? user.technologies.join(', ') : '',
    location: user?.location || '',
    institute: user?.institute || '',
    contactNumber: user?.contactNumber || '',
    organizationName: user?.organizationName || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        technologies: Array.isArray(user.technologies) ? user.technologies.join(', ') : '',
        location: user.location || '',
        institute: user.institute || '',
        contactNumber: user.contactNumber || '',
        organizationName: user.organizationName || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const userId = user._id || user.id;
        const response = await getProjects(userId);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects.");
      } finally {
        setLoadingProjects(false);
      }
    };
    if (user && (user._id || user.id)) {
      fetchUserProjects();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await updateProfile(formData);
      setUser(response.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const techList = formData.technologies
    ? formData.technologies.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50/60 text-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

        {/* Left Column: Student Overview & Edit Profile Form */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">

          {/* Student Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-5 pt-8">
              <div className="relative">
                <img
                  src={user?.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-white"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Online" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {user?.name || "Student Name"}
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-full">
                    Student
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium mt-1">{user?.email}</p>
                {user?.institute && (
                  <p className="text-xs text-indigo-600 font-semibold mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M4.5 21V10.5" />
                    </svg>
                    {user.institute}
                  </p>
                )}
              </div>
            </div>

            {/* Bio & Skills Preview */}
            {user?.bio && (
              <p className="mt-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                "{user.bio}"
              </p>
            )}

            {techList.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {techList.map((tech, idx) => (
                  <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Account Details Card (Read-only) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Account Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Username</p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.email ? user.email.split('@')[0] : '—'}
                </p>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Full Name</p>
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name || '—'}</p>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                <p className="text-xs font-bold text-slate-800 truncate" title={user?.email}>{user?.email || '—'}</p>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Contact Number</p>
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.contactNumber || <span className="text-slate-400 italic font-normal">Not provided</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              Edit Portfolio Profile
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                  rows="3"
                  placeholder="Share a brief overview of your developer journey..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Technologies</label>
                  <input
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    placeholder="React, Node.js, Python"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    placeholder="Colombo, Sri Lanka"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Institute / University</label>
                  <input
                    type="text"
                    name="institute"
                    value={formData.institute}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    placeholder="University of Moratuwa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Organization / Business</label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  placeholder="DevCanvas Lab / Freelance"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Published Showcase Projects */}
        <div className="w-full lg:w-7/12 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  Portfolio Projects
                  <span className="px-3 py-0.5 text-xs font-extrabold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                    {projects.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Showcasing your open-source projects & publications</p>
              </div>

              <Link
                to="/create-project"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Publish Project
              </Link>
            </div>

            {loadingProjects ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-400">Fetching portfolio projects...</p>
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {projects.map(project => (
                  <div
                    key={project._id}
                    className="group bg-slate-50/60 hover:bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col sm:flex-row gap-5"
                  >
                    {/* Cover image */}
                    <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 relative">
                      <img
                        src={project.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-slate-400">
                            {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <Link
                            to={`/edit-project/${project._id}`}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                            Edit
                          </Link>
                        </div>

                        <Link to={`/projects/${project._id}`}>
                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {project.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Footer tags & links */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags && project.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 text-slate-400">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-slate-900 transition-colors p-1"
                              title="GitHub Repository"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                          )}
                          {project.demoUrl && (
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-indigo-600 transition-colors p-1"
                              title="Live Demo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">No Projects Published Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm">Share your work with recruiters and the community by uploading your project details.</p>
                <Link
                  to="/create-project"
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition-all"
                >
                  Publish First Project
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentProfile;

