import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getUserById } from '../api/user.api';
import { toggleFollow, getFollowStatus } from '../api/follow.api';
import ProjectCard from '../components/ProjectCard';

/* ── Helpers ───────────────────────────────────────────────────── */
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

/* ── Back icon ─────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

/* ── Stat item ─────────────────────────────────────────────────── */
const Stat = ({ value, label }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</span>
  </div>
);

/* ── StudentPublicProfilePage ──────────────────────────────────── */
const StudentPublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const isRecruiter = currentUser?.role === 'RECRUITER';

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getUserById(id);
        setProfileData(res.data);
        setFollowerCount(res.data?.followerCount ?? 0);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Student not found.' : 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  // Sync follow status for recruiter
  useEffect(() => {
    if (!isRecruiter || !id) return;
    const isOwnProfile = id === currentUser?._id || id === currentUser?.id;
    if (isOwnProfile) return;
    getFollowStatus(id)
      .then((r) => setFollowing(Boolean(r.data?.following)))
      .catch(() => { });
  }, [id, isRecruiter]);

  const handleFollow = async () => {
    if (!isRecruiter || isFollowing) return;
    setIsFollowing(true);
    try {
      const res = await toggleFollow(id);
      const next = Boolean(res.data?.following);
      setFollowing(next);
      setFollowerCount((c) => c + (next ? 1 : -1));
    } finally {
      setIsFollowing(false);
    }
  };

  /* ── Loading ─────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-l-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-slate-500 text-lg font-medium">{error}</p>
        <button onClick={() => navigate(-1)} className="text-slate-700 font-bold hover:underline text-sm">
          ← Go back
        </button>
      </div>
    );
  }

  const { user, projects = [] } = profileData;
  const initial = user.name?.charAt(0).toUpperCase() || '?';
  const isOwnProfile = id === currentUser?._id || id === currentUser?.id;

  return (
    <div className="flex-1 w-full bg-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 flex flex-col gap-10">

        {/* ── Back ─────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <BackIcon /> Back
        </button>

        {/* ── Profile hero ─────────────────────────────────────── */}
        <div
          className="relative rounded-xl border border-slate-100 bg-white p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 overflow-hidden"
          style={{ animation: 'fadeUp 0.5s ease both' }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at top left, rgba(168,85,247,0.05) 0%, transparent 60%)'
          }} />

          {/* Avatar */}
          {user.profilePic ? (
            <img src={user.profilePic} alt={user.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-black text-4xl ring-4 ring-white shadow-lg shrink-0">
              {initial}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                {user.email && <p className="text-slate-400 text-sm font-medium mt-0.5">{user.email}</p>}
              </div>

              {/* Follow button */}
              {isRecruiter && !isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowing}
                  className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none border ${following
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-slate-900 text-white border-slate-900 hover:bg-black'
                    } disabled:opacity-60`}
                >
                  {isFollowing ? 'Updating…' : following ? '✓ Following' : '+ Follow'}
                </button>
              )}
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                {user.role}
              </span>
              {user.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                  📍 {user.location}
                </span>
              )}
              {user.institute && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                  🎓 {user.institute}
                </span>
              )}
              {user.contactNumber && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                  📞 {user.contactNumber}
                </span>
              )}
              {user.organizationName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                  🏢 {user.organizationName}
                </span>
              )}
              {user.createdAt && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-400 border border-slate-100">
                  Joined {formatDate(user.createdAt)}
                </span>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-slate-600 text-sm leading-relaxed font-medium max-w-xl">
                {user.bio}
              </p>
            )}

            {/* Technologies */}
            {user.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {user.technologies.map((tech) => (
                  <span key={tech} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white uppercase tracking-wide">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats bar ────────────────────────────────────────── */}
        <div
          className="flex items-center justify-around py-5 rounded-xl border border-slate-100 bg-slate-50/50"
          style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}
        >
          <Stat value={projects.length} label="Projects" />
          <div className="w-px h-8 bg-slate-200" />
          <Stat value={followerCount} label="Followers" />
          <div className="w-px h-8 bg-slate-200" />
          <Stat
            value={new Set(projects.flatMap((p) => p.tags || [])).size}
            label="Technologies"
          />
        </div>

        {/* ── Projects ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6" style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Published Projects
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium text-center">
                {user.name} hasn't published any projects yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, idx) => (
                <div
                  key={project._id}
                  className="h-full"
                  style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${idx * 0.06}s` }}
                >
                  <ProjectCard
                    project={{ ...project, studentId: user }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StudentPublicProfilePage;
