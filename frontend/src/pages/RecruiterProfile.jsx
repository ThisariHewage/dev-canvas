import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toggleFollow, getFollowStatus, getFollowerCount } from '../api/follow.api';
import { updateProfile } from '../api/user.api';
import { toast } from 'react-toastify';

const RecruiterProfile = ({ profile: profileProp }) => {
  const location = useLocation();
  const { user, setUser } = useAuthStore();
  const isRecruiter = user?.role === 'RECRUITER';
  const profile = profileProp || location.state?.profile || user || null;
  const isOwnProfile = !profileProp || profile?._id === user?._id || profile?.id === user?.id;

  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile?.followerCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    contactNumber: profile?.contactNumber || '',
    organizationName: profile?.organizationName || '',
    location: profile?.location || '',
    bio: profile?.bio || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFollowerCount(profile?.followerCount ?? 0);
    if (profile) {
      setFormData({
        contactNumber: profile.contactNumber || '',
        organizationName: profile.organizationName || '',
        location: profile.location || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    const syncFollowState = async () => {
      if (!profile?._id || !isRecruiter || profile._id === user?._id) return;

      try {
        const [statusResponse, countResponse] = await Promise.all([
          getFollowStatus(profile._id),
          getFollowerCount(profile._id),
        ]);

        setFollowing(Boolean(statusResponse.data?.following));
        setFollowerCount(countResponse.data?.count ?? 0);
      } catch {
        setFollowing(false);
        setFollowerCount(profile?.followerCount ?? 0);
      }
    };

    syncFollowState();
  }, [profile, isRecruiter, user?._id]);

  const handleFollowToggle = async () => {
    if (!profile?._id || loading || !isRecruiter || profile._id === user?._id) return;

    try {
      setLoading(true);
      setError('');

      const response = await toggleFollow(profile._id);
      const nextFollowing = Boolean(response.data?.following);

      setFollowing(nextFollowing);
      setFollowerCount((current) => current + (nextFollowing ? 1 : -1));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update follow state');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-65px)] bg-slate-50/60 pt-24 px-6 text-slate-500 font-sans flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <p className="text-sm font-semibold">No profile selected.</p>
        </div>
      </div>
    );
  }

  const showFollowButton = isRecruiter && profile._id !== user?._id;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50/60 text-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Recruiter Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 opacity-95" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5 pt-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="relative">
                <img
                  src={profile?.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-white"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Active Recruiter" />
              </div>

              <div className="text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-full">
                    {profile.role || 'RECRUITER'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium mt-1">{profile.email}</p>
                {profile.organizationName && (
                  <p className="text-xs text-purple-600 font-semibold mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3m-6 0h6" />
                    </svg>
                    {profile.organizationName}
                  </p>
                )}
              </div>
            </div>

            {/* Follower Pill & Follow Button */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers</p>
                <p className="text-base font-extrabold text-slate-900">{followerCount}</p>
              </div>

              {showFollowButton && (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={loading}
                  aria-pressed={following}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${following
                    ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20'
                    } disabled:opacity-60`}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {error && <p className="mt-4 text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">{error}</p>}
        </div>

        {/* Account Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Account Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Username</p>
              <p className="text-sm font-bold text-slate-800 truncate">
                {profile?.email ? profile.email.split('@')[0] : '—'}
              </p>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Full Name</p>
              <p className="text-sm font-bold text-slate-800 truncate">{profile?.name || '—'}</p>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
              <p className="text-sm font-bold text-slate-800 truncate" title={profile?.email}>{profile?.email || '—'}</p>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Contact Number</p>
              <p className="text-sm font-bold text-slate-800 truncate">
                {profile?.contactNumber || <span className="text-slate-400 italic font-normal">Not provided</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form (Visible when viewing own profile) */}
        {isOwnProfile && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              Edit Recruiter Profile
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Organization / Business Name</label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                    placeholder="Company or Organization Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                  placeholder="Colombo, Sri Lanka"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Bio / Description</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm resize-none"
                  rows="3"
                  placeholder="Share details about your recruitment focus..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecruiterProfile;


