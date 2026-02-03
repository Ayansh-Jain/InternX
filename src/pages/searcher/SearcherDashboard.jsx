/**
 * Job Searcher Dashboard - For candidates to browse jobs, track applications, and view scores.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Briefcase, MapPin, Clock, DollarSign, Bookmark, BookmarkCheck,
    Send, TrendingUp, Target, Award, ChevronRight, Filter, LogOut,
    CheckCircle, XCircle, Clock as ClockIcon, Eye, Building
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsAPI, applicationsAPI, profileAPI } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const styles = {
    dashboard: {
        minHeight: '100vh',
        background: '#F9FAFB',
        paddingTop: '80px',
    },
    header: {
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '16px 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E6CFA6',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '16px',
    },
    logoText: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '24px',
        color: '#3A4B41',
        letterSpacing: '1px',
    },
    badge: {
        background: '#059669',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    userInfo: {
        textAlign: 'right',
    },
    userName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#3A4B41',
    },
    userRole: {
        fontSize: '12px',
        color: '#6B7280',
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: '#FEF2F2',
        color: '#DC2626',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
    },
    title: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '32px',
        color: '#3A4B41',
        letterSpacing: '1px',
        marginBottom: '24px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '24px',
    },
    main: {
        minWidth: 0,
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    tabs: {
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    tab: {
        padding: '10px 20px',
        background: '#F3F4F6',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#6B7280',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    tabActive: {
        background: '#3A4B41',
        color: '#E6CFA6',
    },
    searchBox: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
    },
    searchInput: {
        flex: 1,
        padding: '14px 16px 14px 44px',
        fontSize: '15px',
        border: '2px solid #E5E7EB',
        borderRadius: '10px',
        outline: 'none',
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9CA3AF',
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    cardTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '18px',
        color: '#3A4B41',
        letterSpacing: '1px',
        marginBottom: '16px',
    },
    scoreCard: {
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
    },
    scoreValue: {
        fontSize: '48px',
        fontWeight: '700',
        color: '#E6CFA6',
    },
    scoreLabel: {
        fontSize: '14px',
        opacity: 0.8,
        marginTop: '4px',
    },
    scoreBreakdown: {
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255,255,255,0.2)',
    },
    scoreItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        marginBottom: '8px',
    },
    jobCard: {
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        transition: 'all 0.2s ease',
    },
    jobHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
    },
    jobTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#3A4B41',
    },
    jobCompany: {
        fontSize: '14px',
        color: '#6B7280',
        marginTop: '4px',
    },
    matchBadge: {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
    },
    jobMeta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '16px',
    },
    jobMetaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#6B7280',
    },
    skillTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '16px',
    },
    skillTag: {
        padding: '4px 10px',
        background: '#F3F4F6',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#374151',
    },
    jobActions: {
        display: 'flex',
        gap: '8px',
        paddingTop: '16px',
        borderTop: '1px solid #F3F4F6',
    },
    actionBtn: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
    },
    primaryBtn: {
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        color: '#E6CFA6',
    },
    secondaryBtn: {
        background: '#F3F4F6',
        color: '#374151',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
    },
    applicationCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        marginBottom: '12px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6B7280',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        padding: '40px',
    },
    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid #E5E7EB',
        borderTop: '3px solid #3A4B41',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
    },
    modalContent: {
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
    },
};

function SearcherDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('browse');
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [score, setScore] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [applyingTo, setApplyingTo] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [jobsRes, appsRes, scoreRes] = await Promise.all([
                jobsAPI.list({ limit: 50 }),
                applicationsAPI.list({ limit: 50 }),
                profileAPI.getScore().catch(() => ({ data: { total_score: 0 } }))
            ]);
            setJobs(jobsRes.data.jobs);
            setApplications(appsRes.data.applications);
            setScore(scoreRes.data);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    const handleApply = async (jobId) => {
        try {
            await applicationsAPI.apply({ job_id: jobId });
            setApplyingTo(null);
            await loadData();
            alert('Application submitted successfully!');
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to apply');
        }
    };

    const handleSaveJob = async (jobId) => {
        try {
            await applicationsAPI.saveJob(jobId);
            loadData();
        } catch (err) {
            console.error('Failed to save job:', err);
        }
    };

    const isApplied = (jobId) => applications.some(a => a.job_id === jobId);

    const getMatchColor = (percentage) => {
        if (percentage >= 70) return { bg: '#D1FAE5', color: '#059669' };
        if (percentage >= 40) return { bg: '#FEF3C7', color: '#D97706' };
        return { bg: '#FEE2E2', color: '#DC2626' };
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'pending': return { icon: ClockIcon, color: '#D97706', bg: '#FEF3C7', label: 'Pending' };
            case 'reviewed': return { icon: Eye, color: '#2563EB', bg: '#DBEAFE', label: 'Reviewed' };
            case 'shortlisted': return { icon: CheckCircle, color: '#059669', bg: '#D1FAE5', label: 'Shortlisted' };
            case 'rejected': return { icon: XCircle, color: '#DC2626', bg: '#FEE2E2', label: 'Rejected' };
            default: return { icon: ClockIcon, color: '#6B7280', bg: '#F3F4F6', label: status };
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.required_skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div style={styles.dashboard}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <Link to="/" style={styles.logo}>
                        <div style={styles.logoIcon}>IX</div>
                        <span style={styles.logoText}>INTERNX</span>
                    </Link>
                    <span style={styles.badge}>JOB SEEKER</span>
                </div>
                <div style={styles.headerRight}>
                    <Link to="/builder" style={{ ...styles.actionBtn, ...styles.secondaryBtn, textDecoration: 'none' }}>
                        Build Resume
                    </Link>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.profile?.fullName || 'User'}</div>
                        <div style={styles.userRole}>{user?.email}</div>
                    </div>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            <div style={styles.container}>
                <h1 style={styles.title}>Job Dashboard</h1>

                <div style={styles.grid}>
                    {/* Main Content */}
                    <div style={styles.main}>
                        {/* Tabs */}
                        <div style={styles.tabs}>
                            <button
                                style={{ ...styles.tab, ...(activeTab === 'browse' ? styles.tabActive : {}) }}
                                onClick={() => setActiveTab('browse')}
                            >
                                <Briefcase size={16} /> Browse Jobs
                            </button>
                            <button
                                style={{ ...styles.tab, ...(activeTab === 'applications' ? styles.tabActive : {}) }}
                                onClick={() => setActiveTab('applications')}
                            >
                                <Send size={16} /> My Applications ({applications.length})
                            </button>
                        </div>

                        {activeTab === 'browse' && (
                            <>
                                {/* Search */}
                                <div style={{ position: 'relative', marginBottom: '20px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                    <input
                                        type="text"
                                        placeholder="Search jobs by title, location, or skills..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{ ...styles.searchInput, paddingLeft: '44px' }}
                                    />
                                </div>

                                {loading ? (
                                    <div style={styles.loading}>
                                        <div style={styles.spinner} />
                                    </div>
                                ) : filteredJobs.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <Briefcase size={40} color="#9CA3AF" />
                                        <h3 style={{ marginTop: '16px', color: '#374151' }}>No jobs found</h3>
                                        <p>Try adjusting your search criteria</p>
                                    </div>
                                ) : (
                                    filteredJobs.map(job => {
                                        const matchColors = getMatchColor(job.match_percentage || 0);
                                        const applied = isApplied(job.id);
                                        return (
                                            <motion.div
                                                key={job.id}
                                                style={styles.jobCard}
                                                whileHover={{ borderColor: '#3A4B41' }}
                                            >
                                                <div style={styles.jobHeader}>
                                                    <div>
                                                        <h3 style={styles.jobTitle}>{job.title}</h3>
                                                        <div style={styles.jobCompany}>
                                                            <Building size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                            {job.provider_company || 'Company'}
                                                        </div>
                                                    </div>
                                                    {job.match_percentage !== null && (
                                                        <span style={{
                                                            ...styles.matchBadge,
                                                            background: matchColors.bg,
                                                            color: matchColors.color
                                                        }}>
                                                            <Target size={14} style={{ marginRight: '4px' }} />
                                                            {job.match_percentage}% Match
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={styles.jobMeta}>
                                                    <span style={styles.jobMetaItem}>
                                                        <MapPin size={14} /> {job.location || 'Remote'}
                                                    </span>
                                                    <span style={styles.jobMetaItem}>
                                                        <Clock size={14} /> {job.employment_type}
                                                    </span>
                                                    <span style={styles.jobMetaItem}>
                                                        <Briefcase size={14} /> {job.required_experience}
                                                    </span>
                                                    {job.salary_range && (
                                                        <span style={styles.jobMetaItem}>
                                                            <DollarSign size={14} />
                                                            ₹{job.salary_range.min?.toLocaleString()} - ₹{job.salary_range.max?.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>

                                                {job.required_skills?.length > 0 && (
                                                    <div style={styles.skillTags}>
                                                        {job.required_skills.slice(0, 5).map((skill, i) => (
                                                            <span key={i} style={styles.skillTag}>{skill}</span>
                                                        ))}
                                                        {job.required_skills.length > 5 && (
                                                            <span style={styles.skillTag}>+{job.required_skills.length - 5}</span>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={styles.jobActions}>
                                                    {applied ? (
                                                        <button style={{ ...styles.actionBtn, background: '#D1FAE5', color: '#059669', cursor: 'default' }}>
                                                            <CheckCircle size={16} /> Applied
                                                        </button>
                                                    ) : (
                                                        <motion.button
                                                            style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                                                            onClick={() => setApplyingTo(job)}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <Send size={16} /> Apply Now
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </>
                        )}

                        {activeTab === 'applications' && (
                            <>
                                {applications.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <Send size={40} color="#9CA3AF" />
                                        <h3 style={{ marginTop: '16px', color: '#374151' }}>No applications yet</h3>
                                        <p>Start applying to jobs to track your progress here</p>
                                    </div>
                                ) : (
                                    applications.map(app => {
                                        const statusDetails = getStatusDetails(app.status);
                                        const StatusIcon = statusDetails.icon;
                                        return (
                                            <div key={app.id} style={styles.applicationCard}>
                                                <div>
                                                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#3A4B41', marginBottom: '4px' }}>
                                                        {app.job_title}
                                                    </h4>
                                                    <p style={{ fontSize: '13px', color: '#6B7280' }}>
                                                        {app.job_company} • Applied {new Date(app.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        background: statusDetails.bg,
                                                        color: statusDetails.color
                                                    }}>
                                                        <StatusIcon size={14} />
                                                        {statusDetails.label}
                                                    </span>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        background: '#E0E7FF',
                                                        color: '#4F46E5'
                                                    }}>
                                                        {app.match_percentage}% Match
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={styles.sidebar}>
                        {/* Score Card */}
                        <div style={styles.scoreCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Award size={20} />
                                Resume Score
                            </div>
                            <div style={styles.scoreValue}>{score?.total_score || 0}</div>
                            <div style={styles.scoreLabel}>out of 100</div>

                            {score?.breakdown && Object.keys(score.breakdown).length > 0 && (
                                <div style={styles.scoreBreakdown}>
                                    {Object.entries(score.breakdown).map(([key, value]) => (
                                        <div key={key} style={styles.scoreItem}>
                                            <span>{key.replace(/_/g, ' ')}</span>
                                            <span>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Link
                                to="/builder"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Improve Score <ChevronRight size={16} />
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Quick Stats</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6B7280', fontSize: '14px' }}>Jobs Applied</span>
                                    <span style={{ fontWeight: '600', color: '#3A4B41' }}>{applications.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6B7280', fontSize: '14px' }}>Shortlisted</span>
                                    <span style={{ fontWeight: '600', color: '#059669' }}>
                                        {applications.filter(a => a.status === 'shortlisted').length}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6B7280', fontSize: '14px' }}>Available Jobs</span>
                                    <span style={{ fontWeight: '600', color: '#3A4B41' }}>{jobs.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Apply Modal */}
            {applyingTo && (
                <div style={styles.modal} onClick={() => setApplyingTo(null)}>
                    <motion.div
                        style={styles.modalContent}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#3A4B41', marginBottom: '8px' }}>
                            Apply to {applyingTo.title}
                        </h3>
                        <p style={{ color: '#6B7280', marginBottom: '24px' }}>
                            at {applyingTo.provider_company || 'Company'}
                        </p>

                        <div style={{
                            padding: '16px',
                            background: '#F3F4F6',
                            borderRadius: '8px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Your Resume Score:</span>
                                <strong>{score?.total_score || 0}/100</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Match Percentage:</span>
                                <strong style={{ color: '#059669' }}>{applyingTo.match_percentage || 0}%</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                style={{ ...styles.actionBtn, ...styles.secondaryBtn }}
                                onClick={() => setApplyingTo(null)}
                            >
                                Cancel
                            </button>
                            <motion.button
                                style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                                onClick={() => handleApply(applyingTo.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Send size={16} /> Submit Application
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                input:focus {
                    border-color: #3A4B41 !important;
                }
                @media (max-width: 900px) {
                    .grid-container {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default SearcherDashboard;
