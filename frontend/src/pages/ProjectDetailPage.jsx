import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toggleLike, getLikeCount, getLikeStatus } from '../api/like.api';
import { toggleFollow, getFollowStatus, getFollowerCount } from '../api/follow.api';
import { getProject } from '../api/project.api';

/* ── Helpers ───────────────────────────────────────────────────── */
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/* ── Back icon ─────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

/* ── Heart icon ────────────────────────────────────────────────── */
const HeartIcon = ({ filled }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

/* ── GitHub icon ───────────────────────────────────────────────── */
const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

/* ── External link icon ────────────────────────────────────────── */
const ExternalIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

/* ── Main Component ────────────────────────────────────────────── */
const ProjectDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isRecruiter = user?.role === 'RECRUITER';

  const [project, setProject] = useState(location.state?.project || null);
  const [isLoadingProject, setIsLoadingProject] = useState(!location.state?.project);

  // Like state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Follow state
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Gallery lightbox
  const [lightboxImg, setLightboxImg] = useState(null);

  /* ── Fetch project if not passed via router state ─────────── */
  useEffect(() => {
    if (project) return;
    const fetch = async () => {
      try {
        const res = await getProject(id);
        setProject(res.data?.data || res.data);
      } catch {
        // handled below
      } finally {
        setIsLoadingProject(false);
      }
    };
    fetch();
  }, [id]);

  /* ── Sync like + follow status once project is known ─────── */
  useEffect(() => {
    if (!project?._id) return;

    // Always fetch the real like count (visible to everyone)
    getLikeCount(project._id)
      .then((r) => setLikeCount(r.data?.count ?? 0))
      .catch(() => { });

    if (isRecruiter) {
      getLikeStatus(project._id)
        .then((r) => setLiked(Boolean(r.data?.liked)))
        .catch(() => { });

      const authorId = project.studentId?._id || project.studentId;
      if (authorId && authorId !== user?._id && authorId !== user?.id) {
        Promise.all([getFollowStatus(authorId), getFollowerCount(authorId)])
          .then(([s, c]) => {
            setFollowing(Boolean(s.data?.following));
            setFollowerCount(c.data?.count ?? 0);
          })
          .catch(() => { });
      }
    }
  }, [project?._id, isRecruiter]);

  /* ── Handlers ──────────────────────────────────────────────── */
  const handleLike = async () => {
    if (!isRecruiter || isLiking) return;
    setIsLiking(true);
    try {
      const res = await toggleLike(project._id);
      const next = Boolean(res.data?.liked);
      setLiked(next);
      setLikeCount((c) => c + (next ? 1 : -1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleFollow = async () => {
    if (!isRecruiter || isFollowing) return;
    const authorId = project.studentId?._id || project.studentId;
    setIsFollowing(true);
    try {
      const res = await toggleFollow(authorId);
      const next = Boolean(res.data?.following);
      setFollowing(next);
      setFollowerCount((c) => c + (next ? 1 : -1));
    } finally {
      setIsFollowing(false);
    }
  };

  /* ── Loading ───────────────────────────────────────────────── */
  if (isLoadingProject) {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-l-purple-600 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-slate-500 text-lg font-medium">Project not found.</p>
        <button onClick={() => navigate('/')} className="text-purple-600 font-bold hover:underline text-sm">
          ← Back to showcase
        </button>
      </div>
    );
  }

  const author = project.studentId && typeof project.studentId === 'object'
    ? project.studentId
    : null;
  const authorName = author?.name || project.studentName || 'Unknown';
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorId = author?._id;
  const isOwnProject = authorId && (authorId === user?._id || authorId === user?.id);

  const allImages = [project.coverImage, ...(project.images || [])].filter(Boolean);

  return (
    <div className="flex-1 w-full bg-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 flex flex-col gap-10">

        {/* ── Back button ───────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <BackIcon /> Back
        </button>

        {/* ── Hero cover image ───────────────────────────────────── */}
        <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden bg-slate-100 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-slate-100">
              <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* ── Main content ───────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left: project details ──────────────────────────── */}
          <div className="flex-1 flex flex-col gap-7 min-w-0">

            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title + meta */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {project.title}
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                Published {formatDate(project.createdAt)}
                {project.updatedAt && project.updatedAt !== project.createdAt && (
                  <span className="ml-2 text-slate-300">· Updated {formatDate(project.updatedAt)}</span>
                )}
              </p>
            </div>

            {/* Like bar */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking || !isRecruiter}
                title={!isRecruiter ? 'Only recruiters can like projects' : liked ? 'Unlike' : 'Like this project'}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-bold transition-all duration-200 focus:outline-none border ${liked
                    ? 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100'
                    : isRecruiter
                      ? 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100'
                      : 'text-slate-600 bg-slate-100 border-slate-300 cursor-default'
                  } disabled:opacity-80`}
              >
                <span className={liked ? 'text-rose-500' : 'text-slate-500'}>
                  <HeartIcon filled={liked} />
                </span>
                <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Description */}
            <div className="flex flex-col gap-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About this project</h2>
              <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line font-medium">
                {project.description}
              </p>
            </div>

            {/* Links */}
            {(project.githubUrl || project.demoUrl) && (
              <div className="flex flex-col gap-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Links</h2>
                <div className="flex flex-wrap gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-sm hover:shadow"
                    >
                      <GitHubIcon /> View on GitHub
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md"
                    >
                      <ExternalIcon /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Reservation Details */}
            {(project.exhibitionName || project.reservationDate || project.stallType || project.preferredStallSize || project.numberOfStalls || project.businessCategory) && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reservation Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                  {project.exhibitionName && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exhibition</span>
                      <span className="text-sm font-semibold text-slate-800">{project.exhibitionName}</span>
                    </div>
                  )}
                  {project.reservationDate && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reservation Date</span>
                      <span className="text-sm font-semibold text-slate-800">{formatDate(project.reservationDate)}</span>
                    </div>
                  )}
                  {project.stallType && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stall Type</span>
                      <span className="text-sm font-semibold text-slate-800">{project.stallType}</span>
                    </div>
                  )}
                  {project.preferredStallSize && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stall Size</span>
                      <span className="text-sm font-semibold text-slate-800">{project.preferredStallSize}</span>
                    </div>
                  )}
                  {project.numberOfStalls && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No. of Stalls</span>
                      <span className="text-sm font-semibold text-slate-800">{project.numberOfStalls}</span>
                    </div>
                  )}
                  {project.businessCategory && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Business Category</span>
                      <span className="text-sm font-semibold text-slate-800">{project.businessCategory}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extra images gallery */}
            {project.images?.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImg(img)}
                      className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 cursor-zoom-in group shadow-sm"
                    >
                      <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 text-white text-[11px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                          Click to enlarge
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar: Author card ─────────────────────── */}
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-24 flex flex-col gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6 flex flex-col gap-5">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Built by</h2>

                {/* Author info */}
                <div
                  onClick={() => authorId && navigate(`/students/${authorId}`)}
                  className={`flex items-center gap-3 ${authorId ? 'cursor-pointer group' : ''}`}
                >
                  {author?.profilePic ? (
                    <img src={author.profilePic} alt={authorName}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md shrink-0 group-hover:ring-purple-200 transition-all" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center font-black text-xl ring-2 ring-white shadow-md shrink-0 group-hover:ring-purple-200 transition-all">
                      {authorInitial}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-slate-900 text-base truncate tracking-tight group-hover:text-purple-700 transition-colors">{authorName}</span>
                    {author?.email && (
                      <span className="text-xs text-slate-400 font-medium truncate">{author.email}</span>
                    )}
                    <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mt-0.5">
                      {author?.role || 'Student'}
                    </span>
                  </div>
                </div>

                {/* Follower count */}
                {isRecruiter && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span><strong className="text-slate-900">{followerCount}</strong> follower{followerCount !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Follow button */}
                {isRecruiter && !isOwnProject && authorId && (
                  <button
                    type="button"
                    onClick={handleFollow}
                    disabled={isFollowing}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none border ${following
                        ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        : 'bg-slate-900 text-white border-slate-900 hover:bg-black'
                      } disabled:opacity-60`}
                  >
                    {isFollowing ? 'Updating…' : following ? '✓ Following' : '+ Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Preview"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
