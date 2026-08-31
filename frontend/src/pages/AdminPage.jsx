// Admin dashboard to manage users and projects
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllUsers, getAllProjects, deleteProject, toggleUserStatus } from '../api/admin.api';
import useAuthStore from '../store/authStore';

/* ─── Toggle User Modal ──────────────────────────────────────────── */
const UserToggleModal = ({ user, onConfirm, onCancel, isToggling }) => {
    const isDisabling = !user.isDisabled;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(8,12,30,0.65)' }}
        >
            <div
                className="relative w-full max-w-md rounded-3xl overflow-hidden"
                style={{
                    animation: 'modalPop 0.28s cubic-bezier(.34,1.56,.64,1) both',
                    background: 'linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)',
                    boxShadow: isDisabling
                        ? '0 32px 80px -12px rgba(220,38,38,0.25), 0 0 0 1px rgba(220,38,38,0.08)'
                        : '0 32px 80px -12px rgba(16,185,129,0.25), 0 0 0 1px rgba(16,185,129,0.08)',
                }}
            >
                {/* Top gradient band */}
                <div style={{ background: isDisabling ? 'linear-gradient(90deg,#ef4444,#f43f5e,#ec4899)' : 'linear-gradient(90deg,#10b981,#34d399,#6ee7b7)', height: 4 }} />

                <div className="relative p-8 flex flex-col items-center text-center gap-6">

                    {/* Animated pulse icon */}
                    <div className="relative flex items-center justify-center">
                        <span className="absolute inline-flex w-20 h-20 rounded-full opacity-20"
                            style={{
                                background: isDisabling ? '#ef4444' : '#10b981',
                                animation: 'ping 1.6s cubic-bezier(0,0,0.2,1) infinite'
                            }}
                        />
                        <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{
                                background: isDisabling ? 'linear-gradient(135deg,#fee2e2,#fecdd3)' : 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                                boxShadow: isDisabling ? '0 8px 24px rgba(239,68,68,0.22)' : '0 8px 24px rgba(16,185,129,0.22)',
                            }}>
                            {isDisabling ? (
                                <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="flex flex-col gap-2">
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                            {isDisabling ? 'Disable User?' : 'Enable User?'}
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {isDisabling ? "You're about to suspend access for" : "You're about to restore access for"}
                        </p>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: isDisabling ? 'linear-gradient(90deg,#fef2f2,#fff0f3)' : 'linear-gradient(90deg,#f0fdf4,#ecfdf5)',
                            border: isDisabling ? '1px solid #fecaca' : '1px solid #a7f3d0', borderRadius: 10,
                            padding: '8px 14px', margin: '0 auto',
                        }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: isDisabling ? '#b91c1c' : '#047857', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name} ({user.email})
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            disabled={isToggling}
                            style={{
                                flex: 1, padding: '11px 0', borderRadius: 14,
                                border: '1.5px solid #e2e8f0', background: '#fff',
                                fontSize: 13.5, fontWeight: 700, color: '#64748b',
                                cursor: 'pointer', transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
                            onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e2e8f0'; }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isToggling}
                            style={{
                                flex: 1, padding: '11px 0', borderRadius: 14, border: 'none',
                                background: isToggling
                                    ? (isDisabling ? '#fca5a5' : '#6ee7b7')
                                    : (isDisabling ? 'linear-gradient(135deg,#ef4444 0%,#f43f5e 60%,#ec4899 100%)' : 'linear-gradient(135deg,#10b981 0%,#34d399 100%)'),
                                fontSize: 13.5, fontWeight: 700, color: '#fff',
                                cursor: isToggling ? 'not-allowed' : 'pointer',
                                boxShadow: isDisabling ? '0 4px 18px rgba(239,68,68,0.35)' : '0 4px 18px rgba(16,185,129,0.35)',
                                transition: 'all 0.18s',
                                opacity: isToggling ? 0.75 : 1,
                            }}
                        >
                            {isToggling ? 'Processing…' : (isDisabling ? 'Yes, Disable' : 'Yes, Enable')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Delete Confirmation Modal ──────────────────────────────────── */
const DeleteModal = ({ projectTitle, onConfirm, onCancel, isDeleting }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(8,12,30,0.65)' }}
    >
        <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{
                animation: 'modalPop 0.28s cubic-bezier(.34,1.56,.64,1) both',
                background: 'linear-gradient(135deg,#ffffff 0%,#fff5f5 100%)',
                boxShadow: '0 32px 80px -12px rgba(220,38,38,0.25), 0 0 0 1px rgba(220,38,38,0.08)',
            }}
        >
            {/* Top gradient band */}
            <div style={{ background: 'linear-gradient(90deg,#ef4444,#f43f5e,#ec4899)', height: 4 }} />

            {/* Decorative blurred circles */}
            <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 180, height: 180, borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(239,68,68,0.12),transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: -30, left: -30,
                width: 140, height: 140, borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(244,63,94,0.10),transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="relative p-8 flex flex-col items-center text-center gap-6">

                {/* Animated pulse icon */}
                <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex w-20 h-20 rounded-full opacity-20"
                        style={{ background: '#ef4444', animation: 'ping 1.6s cubic-bezier(0,0,0.2,1) infinite' }} />
                    <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg,#fee2e2,#fecdd3)',
                            boxShadow: '0 8px 24px rgba(239,68,68,0.22)',
                        }}>
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none"
                            stroke="url(#trashGrad)" strokeWidth={1.8}>
                            <defs>
                                <linearGradient id="trashGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#f43f5e" />
                                </linearGradient>
                            </defs>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <div className="flex flex-col gap-2">
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                        Delete this project?
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        You're about to permanently remove
                    </p>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'linear-gradient(90deg,#fef2f2,#fff0f3)',
                        border: '1px solid #fecaca', borderRadius: 10,
                        padding: '8px 14px', margin: '0 auto',
                    }}>
                        <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#b91c1c', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {projectTitle}
                        </span>
                    </div>
                </div>

                {/* Consequence checklist */}
                <div style={{
                    width: '100%', background: '#fafafa',
                    border: '1px solid #f1f5f9', borderRadius: 14, padding: '14px 16px',
                    display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                    {[
                        'Project details & description',
                        'All associated media & files',
                        'Submission record from the system',
                    ].map((item) => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                background: 'linear-gradient(135deg,#ef4444,#f43f5e)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>{item}</span>
                        </div>
                    ))}
                </div>

                {/* Warning badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'linear-gradient(90deg,#fff1f2,#fdf2f8)',
                    border: '1px solid #fecdd3', borderRadius: 999,
                    padding: '6px 14px', fontSize: 11.5, fontWeight: 700,
                    color: '#be123c', letterSpacing: '0.02em',
                }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    This action is irreversible and cannot be undone
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            flex: 1, padding: '11px 0', borderRadius: 14,
                            border: '1.5px solid #e2e8f0', background: '#fff',
                            fontSize: 13.5, fontWeight: 700, color: '#64748b',
                            cursor: 'pointer', transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
                        onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e2e8f0'; }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            flex: 1, padding: '11px 0', borderRadius: 14, border: 'none',
                            background: isDeleting
                                ? 'linear-gradient(135deg,#fca5a5,#fda4af)'
                                : 'linear-gradient(135deg,#ef4444 0%,#f43f5e 60%,#ec4899 100%)',
                            fontSize: 13.5, fontWeight: 700, color: '#fff',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 18px rgba(239,68,68,0.35)',
                            transition: 'all 0.18s',
                            opacity: isDeleting ? 0.75 : 1,
                        }}
                    >
                        {isDeleting ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <svg style={{ width: 15, height: 15, animation: 'spin 0.8s linear infinite' }}
                                    viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
                                </svg>
                                Deleting…
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Yes, Delete Project
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes modalPop {
                from { opacity:0; transform:scale(0.82) translateY(24px); }
                to   { opacity:1; transform:scale(1)   translateY(0); }
            }
            @keyframes ping {
                75%,100% { transform:scale(1.8); opacity:0; }
            }
            @keyframes spin {
                to { transform:rotate(360deg); }
            }
            @keyframes tabFadeIn {
                from { opacity:0; transform:translateY(12px); }
                to   { opacity:1; transform:translateY(0); }
            }
        `}</style>
    </div>
);

/* ─── Main AdminPage ─────────────────────────────────────────────── */
const AdminPage = () => {
    const [searchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const validTabs = ['Users', 'Projects', 'Profile'];
    const initialTab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'Users';
    const [activeTab, setActiveTab] = useState(initialTab);
    const { user: adminUser } = useAuthStore();

    // Modal state
    const [modalTarget, setModalTarget] = useState(null); // { id, title }
    const [isDeleting, setIsDeleting] = useState(false);

    // User Toggle Modal state
    const [userToggleTarget, setUserToggleTarget] = useState(null);
    const [isTogglingUser, setIsTogglingUser] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [usersRes, projectsRes] = await Promise.all([
                    getAllUsers(),
                    getAllProjects()
                ]);
                setUsers(usersRes.data.data);
                setProjects(projectsRes.data.data);
            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to load data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const formatDateTime = (dateStr) =>
        new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const roleColors = {
        ADMIN: 'bg-red-50 text-red-600',
        STUDENT: 'bg-purple-50 text-purple-600',
        RECRUITER: 'bg-blue-50 text-blue-600',
    };

    const confirmDelete = async () => {
        if (!modalTarget) return;
        setIsDeleting(true);
        try {
            await deleteProject(modalTarget.id);
            setProjects((prev) => prev.filter((p) => p._id !== modalTarget.id));
            setModalTarget(null);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to delete project.');
            setModalTarget(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmToggleUser = async () => {
        if (!userToggleTarget) return;
        setIsTogglingUser(true);
        try {
            await toggleUserStatus(userToggleTarget._id);
            setUsers(users.map(u => u._id === userToggleTarget._id ? { ...u, isDisabled: !u.isDisabled } : u));
            setUserToggleTarget(null);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to toggle user status');
            setUserToggleTarget(null);
        } finally {
            setIsTogglingUser(false);
        }
    };

    return (
        <div className="flex-1 w-full bg-slate-50 relative overflow-hidden text-slate-800 font-sans flex flex-col">

            {/* Ambient gradients */}
            <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <div style={{ position: 'absolute', top: -150, left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: -100, right: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%' }} />
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {modalTarget && (
                <DeleteModal
                    projectTitle={modalTarget.title}
                    onConfirm={confirmDelete}
                    onCancel={() => setModalTarget(null)}
                    isDeleting={isDeleting}
                />
            )}

            {/* ── Toggle User Confirmation Modal ── */}
            {userToggleTarget && (
                <UserToggleModal
                    user={userToggleTarget}
                    onConfirm={confirmToggleUser}
                    onCancel={() => setUserToggleTarget(null)}
                    isToggling={isTogglingUser}
                />
            )}

            <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-12 py-10 flex flex-col gap-8 box-border">

                {/* Page Header */}
                <section className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Manage users and project submissions</p>
                    </div>
                </section>

                {/* Stats Row */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { label: 'Total Users', value: users.length || '—', icon: '👥', gradient: 'from-blue-500 to-indigo-500' },
                        { label: 'Total Projects', value: projects.length || '—', icon: '📁', gradient: 'from-purple-500 to-pink-500' },
                    ].map((stat, i) => (
                        <div key={stat.label} className="relative overflow-hidden rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white/40 px-6 py-6 flex items-center gap-5 backdrop-blur-xl group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300" style={{ animation: 'tabFadeIn 0.5s ease both', animationDelay: `${i * 0.1}s` }}>
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} p-[1px] shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-[15px] flex items-center justify-center text-2xl">
                                    {stat.icon}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Tab Switcher */}
                <div className="flex gap-2 p-1.5 bg-slate-200/50 backdrop-blur-sm border border-slate-200/50 rounded-[14px] w-fit">
                    {['Users', 'Projects'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-300 cursor-pointer focus:outline-none ${activeTab === tab
                                ? 'bg-white text-purple-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
                                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-l-purple-600 animate-spin" />
                    </div>
                )}

                {/* ── USERS TAB ── */}
                {!isLoading && activeTab === 'Users' && (
                    <section key="users" className="flex flex-col gap-6 relative" style={{ animation: 'tabFadeIn 0.4s ease both' }}>
                        <div className="flex flex-col gap-1.5 mb-2 px-1">
                            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight flex items-center gap-3">
                                Registered Users
                                {users.length > 0 && (
                                    <span className="inline-flex items-center justify-center px-3.5 py-1 bg-purple-50 text-purple-700 text-sm font-bold rounded-full border border-purple-100 shadow-sm">
                                        {users.length}
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm font-medium text-slate-500">Manage account access, roles, and status of all platform members.</p>
                        </div>

                        {users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200/80 rounded-[32px] bg-slate-50/50 backdrop-blur-sm">
                                <div className="w-20 h-20 rounded-full bg-slate-100/80 flex items-center justify-center mb-5 shadow-inner">
                                    <span className="text-4xl grayscale opacity-60">👥</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1.5">No Users Found</h3>
                                <p className="text-slate-400 text-sm text-center max-w-sm font-medium">There are no registered users available at the moment. New signups will appear here.</p>
                            </div>
                        ) : (
                            <div className="bg-white/80 rounded-2xl border border-slate-100/80 overflow-x-auto shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-3xl pb-2 mt-2">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-100/50 text-slate-500 font-bold uppercase tracking-wider text-[12px]">
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50/80">
                                        {users.map((user, idx) => (
                                            <tr key={user._id} className="hover:bg-purple-50/30 transition-all duration-200 relative z-0 hover:z-10 group"
                                                style={{ animation: 'tabFadeIn 0.35s ease both', animationDelay: `${idx * 0.04}s` }}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            {user.profilePic ? (
                                                                <img src={user.profilePic} alt={user.name}
                                                                    className={`w-10 h-10 rounded-full object-cover shadow-sm shrink-0 ${user.isDisabled ? 'grayscale opacity-50 ring-2 ring-slate-200' : 'ring-2 ring-purple-200'}`} />
                                                            ) : (
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${user.isDisabled ? 'bg-slate-100 text-slate-400 ring-2 ring-slate-200' : 'bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white ring-2 ring-purple-200'}`}>
                                                                    {user.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}

                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`font-extrabold tracking-tight ${user.isDisabled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{user.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {user._id?.slice(-6).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-4 font-medium tracking-tight ${user.isDisabled ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${user.isDisabled ? 'border-slate-100 bg-slate-50 text-slate-400' : (user.role === 'ADMIN' ? 'border-red-100 bg-red-50 text-red-600' : user.role === 'STUDENT' ? 'border-purple-100 bg-purple-50 text-purple-600' : 'border-blue-100 bg-blue-50 text-blue-600')}`}>
                                                        {!user.isDisabled && user.role === 'ADMIN' && (
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                            </svg>
                                                        )}
                                                        {!user.isDisabled && user.role === 'STUDENT' && (
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                                                            </svg>
                                                        )}
                                                        {!user.isDisabled && user.role === 'RECRUITER' && (
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        )}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.isDisabled ? (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Disabled
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 font-medium tracking-tight">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                        </svg>
                                                        {formatDate(user.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 flex justify-center items-center h-full min-h-[52px]">
                                                    {user._id !== adminUser?.id && user._id !== adminUser?._id ? (
                                                        <button
                                                            onClick={() => setUserToggleTarget(user)}
                                                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none ${user.isDisabled
                                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-sm'
                                                                : 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm'
                                                                }`}
                                                        >
                                                            {user.isDisabled ? (
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            )}
                                                            {user.isDisabled ? 'Enable' : 'Disable'}
                                                        </button>
                                                    ) : (
                                                        <div
                                                            className="inline-flex items-center gap-1 h-[30px] px-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-300 text-xs font-bold select-none"
                                                            title="Current User"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                            </svg>
                                                            You
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ── PROJECTS TAB ── */}
                {!isLoading && activeTab === 'Projects' && (
                    <section key="projects" className="flex flex-col gap-6 relative" style={{ animation: 'tabFadeIn 0.4s ease both' }}>
                        <div className="flex flex-col gap-1.5 mb-2 px-1">
                            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight flex items-center gap-3">
                                Project Submissions
                                {projects.length > 0 && (
                                    <span className="inline-flex items-center justify-center px-3.5 py-1 bg-purple-50 text-purple-700 text-sm font-bold rounded-full border border-purple-100 shadow-sm">
                                        {projects.length}
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm font-medium text-slate-500">Manage, moderate, and review all active project submissions across the platform.</p>
                        </div>

                        {projects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200/80 rounded-[32px] bg-slate-50/50 backdrop-blur-sm">
                                <div className="w-20 h-20 rounded-full bg-slate-100/80 flex items-center justify-center mb-5 shadow-inner">
                                    <span className="text-4xl grayscale opacity-60">📁</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1.5">No Projects Found</h3>
                                <p className="text-slate-400 text-sm text-center max-w-sm font-medium">There are no project submissions available at the moment. New projects will appear here.</p>
                            </div>
                        ) : (
                            <div className="bg-white/80 rounded-2xl border border-slate-100/80 overflow-x-auto shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-3xl pb-2 mt-2">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-100/50 text-slate-500 font-bold uppercase tracking-wider text-[12px]">
                                            <th className="px-6 py-4">Project</th>
                                            <th className="px-6 py-4">Author</th>
                                            <th className="px-6 py-4">Created</th>
                                            <th className="px-6 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50/80">
                                        {projects.map((project, idx) => (
                                            <tr key={project._id} className="hover:bg-purple-50/30 transition-all duration-200 relative z-0 hover:z-10 group"
                                                style={{ animation: 'tabFadeIn 0.35s ease both', animationDelay: `${idx * 0.04}s` }}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                                            {project.coverImage ? (
                                                                <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover shadow-sm ring-1 ring-slate-200" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 ring-1 ring-slate-200">
                                                                    <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col max-w-[200px] sm:max-w-[300px]">
                                                            <span className="font-extrabold text-slate-800 tracking-tight truncate">{project.title}</span>
                                                            <span className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{project.description || 'No description'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {project.studentId?.profilePic ? (
                                                            <img src={project.studentId.profilePic} alt={project.studentId.name} className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 ring-1 ring-slate-200">
                                                                {project.studentId?.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="font-bold tracking-tight text-slate-700">{project.studentId?.name || 'Unknown User'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 font-medium tracking-tight text-xs">
                                                    {formatDateTime(project.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 flex justify-center items-center h-full min-h-[52px]">
                                                    <button
                                                        onClick={() => setModalTarget({ id: project._id, title: project.title })}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ── PROFILE TAB ── */}
                {!isLoading && activeTab === 'Profile' && (
                    <section key="profile" className="flex flex-col gap-6" style={{ animation: 'tabFadeIn 0.3s ease both' }}>

                        {/* Admin Info Card */}
                        <div style={{
                            borderRadius: 20,
                            background: 'linear-gradient(135deg,#faf5ff 0%,#f5f3ff 100%)',
                            border: '1px solid #ede9fe',
                            padding: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 24,
                            flexWrap: 'wrap',
                        }}>
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                {adminUser?.profilePic ? (
                                    <img
                                        src={adminUser.profilePic}
                                        alt={adminUser.name}
                                        style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #7c3aed', boxShadow: '0 8px 24px rgba(124,58,237,0.22)' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 88, height: 88, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 34, fontWeight: 900, color: '#fff',
                                        boxShadow: '0 8px 24px rgba(124,58,237,0.25)',
                                    }}>
                                        {adminUser?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {/* Online dot */}
                                <span style={{
                                    position: 'absolute', bottom: 4, right: 4,
                                    width: 14, height: 14, borderRadius: '50%',
                                    background: '#22c55e', border: '2px solid #fff',
                                }} />
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 180 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.4px' }}>
                                        {adminUser?.name}
                                    </h2>
                                    {/* Role badge */}
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                                        color: '#fff', fontSize: 10, fontWeight: 800,
                                        letterSpacing: '0.08em', textTransform: 'uppercase',
                                        padding: '3px 10px', borderRadius: 999,
                                    }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                        Admin
                                    </span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 4 }}>{adminUser?.email}</p>
                                {adminUser?.createdAt && (
                                    <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                        Member since {new Date(adminUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                            {[
                                { label: 'Total Users', value: users.length || '—', icon: '👥', color: '#7c3aed', bg: '#f5f3ff' },
                                { label: 'Total Projects', value: projects.length || '—', icon: '📁', color: '#0ea5e9', bg: '#f0f9ff' },
                                { label: 'Your Role', value: 'Admin', icon: '🛡️', color: '#059669', bg: '#f0fdf4' },
                            ].map((stat) => (
                                <div key={stat.label} style={{
                                    borderRadius: 16, border: `1px solid ${stat.bg}`,
                                    background: stat.bg, padding: '20px 22px',
                                    display: 'flex', flexDirection: 'column', gap: 8,
                                }}>
                                    <span style={{ fontSize: 26 }}>{stat.icon}</span>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
                                    <p style={{ fontSize: 26, fontWeight: 900, color: stat.color, letterSpacing: '-0.5px' }}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Permissions Card */}
                        <div style={{ borderRadius: 16, border: '1px solid #f1f5f9', background: '#fafafa', padding: '20px 22px' }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Admin Permissions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    'View all registered users',
                                    'Browse and manage all project submissions',
                                    'Delete any project from the system',
                                    'Full platform oversight & moderation',
                                ].map((perm) => (
                                    <div key={perm} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                            background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </section>
                )}

            </main>
        </div>
    );
};

export default AdminPage;
