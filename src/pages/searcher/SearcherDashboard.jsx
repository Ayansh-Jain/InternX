/**
 * Job Searcher Dashboard - For candidates to browse jobs, track applications, and view scores.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Briefcase, MapPin, Clock, DollarSign, Bookmark, BookmarkCheck,
    Send, TrendingUp, Target, Award, ChevronRight, Filter, LogOut,
    CheckCircle, XCircle, Clock as ClockIcon, Eye, Building, X,
    Check, ArrowRight, Wand2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsAPI, applicationsAPI, profileAPI, searchAPI, recommendationsAPI } from '../../services/api';
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
    filterSidebar: {
        position: 'fixed',
        right: 0,
        top: '73px',
        bottom: 0,
        width: '300px',
        background: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.05)',
        zIndex: 90,
        padding: '24px',
        overflowY: 'auto',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
    },
    filterSidebarOpen: {
        transform: 'translateX(0)',
    },
    filterGroup: {
        marginBottom: '20px',
    },
    filterLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
        display: 'block',
    },
    filterInput: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        outline: 'none',
    },
    filterSelect: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        outline: 'none',
        background: 'white',
    },
    applyFiltersBtn: {
        width: '100%',
        padding: '12px',
        background: '#3A4B41',
        color: '#E6CFA6',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '20px',
    },
};

function SearcherDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('browse');
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [likedJobs, setLikedJobs] = useState(new Set());
    const [score, setScore] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        jobRole: '',
        location: '',
        employmentType: '',
        minSalary: '',
        maxSalary: '',
        experience: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [applyingTo, setApplyingTo] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [generatedBio, setGeneratedBio] = useState('');
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);
    const [bioError, setBioError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // AI Web Search State
    const [webResults, setWebResults] = useState([]);
    const [webLoading, setWebLoading] = useState(false);
    const [webError, setWebError] = useState('');
    const [showWebResults, setShowWebResults] = useState(false);
    const [webQuery, setWebQuery] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    // Debounce search
    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            if (activeTab === 'browse') loadData();
        }, 500);
        setTypingTimeout(timeout);
    }, [searchQuery]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = { limit: 50 };

            if (activeTab === 'browse') {
                if (searchQuery) params.search = searchQuery;
                if (filters.location) params.location = filters.location;
                if (filters.employmentType) params.employment_type = filters.employmentType;
                if (filters.minSalary) params.min_salary = filters.minSalary;
                if (filters.maxSalary) params.max_salary = filters.maxSalary;
                if (filters.experience) params.experience = filters.experience;
                if (filters.jobRole) params.search = filters.jobRole; // Combine with search or specific param if available
            }

            const [jobsRes, appsRes, scoreRes] = await Promise.all([
                jobsAPI.list(params),
                applicationsAPI.list({ limit: 50 }),
                profileAPI.getScore().catch(() => ({ data: { total_score: 0 } }))
            ]);
            setJobs(jobsRes.data.jobs);
            setApplications(appsRes.data.applications);
            setScore(scoreRes.data);

            if (activeTab === 'for-you') {
                 const recsRes = await recommendationsAPI.getFeed({ limit: 20 });
                 setRecommendedJobs(recsRes.data.jobs || []);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInteraction = async (jobId, action) => {
        try {
            await recommendationsAPI.interact({
                user_id: user.id || user._id, 
                job_id: jobId,
                action: action
            });
            // If they liked or applied, refresh the 'for-you' feed in the background to show new recs
            if (action === 'like' || action === 'apply') {
                recommendationsAPI.getFeed({ limit: 20 }).then(res => setRecommendedJobs(res.data.jobs || []));
            }
        } catch (err) {
            console.error(`Failed to log ${action} interaction:`, err);
        }
    };

    const handleJobClick = (jobId) => {
        handleInteraction(jobId, 'click');
    };

    const toggleLike = (e, jobId) => {
        e.stopPropagation(); // prevent triggering job click
        setLikedJobs(prev => {
            const next = new Set(prev);
            if (next.has(jobId)) {
                next.delete(jobId);
                // Depending on requirements, we might not send an API call for 'unlike', 
                // but we definitely want to log 'like'.
            } else {
                next.add(jobId);
                handleInteraction(jobId, 'like');
            }
            return next;
        });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        loadData();
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({ jobRole: '', location: '', employmentType: '', minSalary: '', maxSalary: '', experience: '' });
        setTimeout(() => loadData(), 100);
    };

    // AI Web Search Handler
    const handleWebSearch = async () => {
        const query = searchQuery.trim();
        if (!query) {
            setWebError('Please type something in the search box first.');
            return;
        }
        setWebLoading(true);
        setWebError('');
        setShowWebResults(true);
        setWebQuery(query);
        setWebResults([]);
        try {
            const params = { q: query };
            if (filters.location) params.location = filters.location;
            if (filters.employmentType) params.job_type = filters.employmentType;
            const res = await searchAPI.external(params);
            setWebResults(res.data.results || []);
        } catch (err) {
            setWebError('Search failed. Please check the backend is running.');
        } finally {
            setWebLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    const handleApply = async (jobId) => {
        try {
            await applicationsAPI.apply({ 
                job_id: jobId,
                // Even though the backend might not currently save the bio in the Application model,
                // we send it here so it can be added to their system later, or attached to their profile.
                bio: generatedBio || undefined
            });
            
            // Log the apply interaction
            handleInteraction(jobId, 'apply');

            setApplyingTo(null);
            setGeneratedBio('');
            await loadData();
            setShowSuccess(true);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to apply');
        }
    };
    
    const handleGenerateBio = async () => {
        if (!applyingTo) return;
        
        setIsGeneratingBio(true);
        setBioError('');
        
        try {
            // First we need to get the user's latest resume data since it's not currently stored in the simple user object
            // The profileAPI.get() should return the parsed resume JSON if the user uploaded one
            const profileRes = await profileAPI.get();
            const resumeData = profileRes.data.profile?.resumeData || profileRes.data.resumeData;
            
            if (!resumeData) {
                setBioError("No resume data found. Please build or upload your resume first in the Resume Builder.");
                setIsGeneratingBio(false);
                return;
            }
            
            const bioData = {
                resume: resumeData,
                job_role: applyingTo.title,
                job_description: applyingTo.description || applyingTo.title
            };
            
            const res = await profileAPI.generateBio(bioData);
            setGeneratedBio(res.data.bio);
            
        } catch (err) {
            console.error('Bio generation error:', err);
            setBioError(err.response?.data?.detail || 'Failed to generate AI Bio. Please check your API configuration or try again.');
        } finally {
            setIsGeneratingBio(false);
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
                    <button
                        onClick={() => navigate('/searcher/web-search')}
                        style={{
                            ...styles.actionBtn,
                            background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
                            color: '#E6CFA6',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.3px',
                        }}
                    >
                        ✨ Search Web
                    </button>
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
                                style={{ ...styles.tab, ...(activeTab === 'for-you' ? styles.tabActive : {}) }}
                                onClick={() => setActiveTab('for-you')}
                            >
                                <Award size={16} /> For You
                            </button>
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

                        {activeTab === 'for-you' && (
                            <>
                                {loading ? (
                                    <div style={styles.loading}>
                                        <div style={styles.spinner} />
                                    </div>
                                ) : recommendedJobs.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <TrendingUp size={40} color="#9CA3AF" />
                                        <h3 style={{ marginTop: '16px', color: '#374151' }}>No Recommendations Yet</h3>
                                        <p>Start interacting with jobs (view, click, like, apply) to build your customized feed!</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6B7280' }}>
                                            Personalized recommendations based on your profile and activity.
                                        </div>
                                        {recommendedJobs.map(job => {
                                            const matchColors = getMatchColor(job.match_percentage || 0);
                                            const applied = isApplied(job.id);
                                            const isLiked = likedJobs.has(job.id);
                                            return (
                                                <motion.div
                                                    key={job.id}
                                                    style={styles.jobCard}
                                                    whileHover={{ borderColor: '#3A4B41', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                                    onClick={() => handleJobClick(job.id)}
                                                    onViewportEnter={() => handleInteraction(job.id, 'view')}
                                                >
                                                    <div style={styles.jobHeader}>
                                                        <div>
                                                            <h3 style={styles.jobTitle}>{job.title}</h3>
                                                            <div style={styles.jobCompany}>
                                                                <Building size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                                {job.provider_company || 'Company'}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                                            <button 
                                                                onClick={(e) => toggleLike(e, job.id)}
                                                                style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                                    color: isLiked ? '#E11D48' : '#9CA3AF',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    padding: '4px'
                                                                }}
                                                            >
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
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
                                                            <button style={{ ...styles.actionBtn, background: '#D1FAE5', color: '#059669', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
                                                                <CheckCircle size={16} /> Applied
                                                            </button>
                                                        ) : (
                                                            <motion.button
                                                                style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                                                                onClick={(e) => { e.stopPropagation(); setApplyingTo(job); }}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <Send size={16} /> Apply Now
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === 'browse' && (
                            <>
                                {/* Search Bar */}
                                <div style={{ position: 'relative', marginBottom: '12px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                    <input
                                        type="text"
                                        placeholder="Search jobs by title or skills..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleWebSearch()}
                                        style={{ ...styles.searchInput, paddingLeft: '44px', paddingRight: '180px' }}
                                    />
                                    <button
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 14px',
                                            background: Object.values(filters).some(Boolean) ? '#E6CFA6' : '#F3F4F6',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#374151'
                                        }}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <Filter size={15} /> Filters
                                    </button>
                                </div>

                                {/* AI Web Search Button */}
                                <button
                                    onClick={handleWebSearch}
                                    disabled={webLoading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        marginBottom: '20px',
                                        background: webLoading
                                            ? '#6B7280'
                                            : 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
                                        color: '#E6CFA6',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: webLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        letterSpacing: '0.5px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {webLoading ? (
                                        <>
                                            <div style={{
                                                width: '16px', height: '16px',
                                                border: '2px solid rgba(230,207,166,0.3)',
                                                borderTop: '2px solid #E6CFA6',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite'
                                            }} />
                                            Searching LinkedIn, Indeed, Internshala...
                                        </>
                                    ) : (
                                        <>
                                            ✨ Search Web for "{searchQuery || 'opportunities'}"
                                        </>
                                    )}
                                </button>

                                {loading ? (
                                    <div style={styles.loading}>
                                        <div style={styles.spinner} />
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <Briefcase size={40} color="#9CA3AF" />
                                        <h3 style={{ marginTop: '16px', color: '#374151' }}>No jobs found</h3>
                                        <p>Try adjusting your search or filters</p>
                                        <button
                                            onClick={clearFilters}
                                            style={{ ...styles.actionBtn, ...styles.secondaryBtn, marginTop: '12px' }}
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                ) : (
                                        jobs.map(job => {
                                            const matchColors = getMatchColor(job.match_percentage || 0);
                                            const applied = isApplied(job.id);
                                            const isLiked = likedJobs.has(job.id);
                                            return (
                                                <motion.div
                                                    key={job.id}
                                                    style={styles.jobCard}
                                                    whileHover={{ borderColor: '#3A4B41' }}
                                                    onClick={() => handleJobClick(job.id)}
                                                    onViewportEnter={() => handleInteraction(job.id, 'view')}
                                                >
                                                    <div style={styles.jobHeader}>
                                                        <div>
                                                            <h3 style={styles.jobTitle}>{job.title}</h3>
                                                            <div style={styles.jobCompany}>
                                                                <Building size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                                {job.provider_company || 'Company'}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                                            <button 
                                                                onClick={(e) => toggleLike(e, job.id)}
                                                                style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                                    color: isLiked ? '#E11D48' : '#9CA3AF',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    padding: '4px'
                                                                }}
                                                            >
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
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
                                                            <button style={{ ...styles.actionBtn, background: '#D1FAE5', color: '#059669', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
                                                                <CheckCircle size={16} /> Applied
                                                            </button>
                                                        ) : (
                                                            <motion.button
                                                                style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                                                                onClick={(e) => { e.stopPropagation(); setApplyingTo(job); }}
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

                                {/* ─── AI Web Search Results ─── */}
                                {showWebResults && (
                                    <div style={{ marginTop: '32px' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', marginBottom: '16px'
                                        }}>
                                            <div>
                                                <h3 style={{
                                                    fontFamily: "'Bebas Neue', sans-serif",
                                                    fontSize: '1.6rem', color: '#3A4B41', letterSpacing: '1px'
                                                }}>
                                                    ✨ WEB RESULTS FOR "{webQuery.toUpperCase()}"
                                                </h3>
                                                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                                                    Direct links from LinkedIn, Indeed, Internshala & more
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowWebResults(false)}
                                                style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#6B7280', fontSize: '13px' }}
                                            >
                                                <X size={14} /> Hide
                                            </button>
                                        </div>

                                        {webError && (
                                            <div style={{ padding: '16px', background: '#FEE2E2', borderRadius: '10px', color: '#DC2626', marginBottom: '16px', fontSize: '14px' }}>
                                                ⚠ {webError}
                                            </div>
                                        )}

                                        {webLoading ? (
                                            <div style={styles.loading}><div style={styles.spinner} /></div>
                                        ) : webResults.map((result, i) => (
                                            <motion.div
                                                key={result.id || i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                style={{
                                                    ...styles.jobCard,
                                                    borderLeft: result.is_verified ? '3px solid #059669' : '3px solid #E5E7EB',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Source badge */}
                                                <div style={{
                                                    display: 'flex', justifyContent: 'space-between',
                                                    alignItems: 'flex-start', marginBottom: '8px'
                                                }}>
                                                    <div>
                                                        <h3 style={{ ...styles.jobTitle, marginBottom: '2px' }}>{result.title}</h3>
                                                        <div style={styles.jobCompany}>
                                                            <Building size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                            {result.company}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        background: result.is_verified ? '#D1FAE5' : '#F3F4F6',
                                                        color: result.is_verified ? '#059669' : '#6B7280',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {result.is_verified ? '✓ ' : ''}{result.source}
                                                    </span>
                                                </div>

                                                <div style={styles.jobMeta}>
                                                    <span style={styles.jobMetaItem}><MapPin size={13} /> {result.location}</span>
                                                    <span style={styles.jobMetaItem}><Briefcase size={13} /> {result.type}</span>
                                                    {result.salary && (
                                                        <span style={styles.jobMetaItem}><DollarSign size={13} /> {result.salary}</span>
                                                    )}
                                                </div>

                                                {result.description_snippet && (
                                                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '10px 0', lineHeight: '1.5' }}>
                                                        {result.description_snippet}
                                                    </p>
                                                )}

                                                <div style={styles.jobActions}>
                                                    <a
                                                        href={result.apply_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            ...styles.actionBtn,
                                                            ...styles.primaryBtn,
                                                            textDecoration: 'none',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        <ChevronRight size={16} /> Apply on {result.source}
                                                    </a>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
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

            {/* Filter Sidebar */}
            <div style={{
                ...styles.filterSidebar,
                ...(showFilters ? styles.filterSidebarOpen : {})
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#3A4B41' }}>Filters</h3>
                    <button
                        onClick={() => setShowFilters(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Job Role</label>
                    <input
                        style={styles.filterInput}
                        placeholder="e.g. Frontend Developer"
                        value={filters.jobRole}
                        onChange={(e) => handleFilterChange('jobRole', e.target.value)}
                    />
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Location</label>
                    <input
                        style={styles.filterInput}
                        placeholder="e.g. Remote, New York"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Employment Type</label>
                    <select
                        style={styles.filterSelect}
                        value={filters.employmentType}
                        onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Salary Range</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="number"
                            style={styles.filterInput}
                            placeholder="Min"
                            value={filters.minSalary}
                            onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                        />
                        <input
                            type="number"
                            style={styles.filterInput}
                            placeholder="Max"
                            value={filters.maxSalary}
                            onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                        />
                    </div>
                </div>

                <div style={styles.filterGroup}>
                    <label style={styles.filterLabel}>Experience Level</label>
                    <select
                        style={styles.filterSelect}
                        value={filters.experience}
                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="Entry Level">Entry Level</option>
                        <option value="Mid Level">Mid Level</option>
                        <option value="Senior Level">Senior Level</option>
                    </select>
                </div>

                <button style={styles.applyFiltersBtn} onClick={applyFilters}>
                    Apply Filters
                </button>

                <button
                    onClick={clearFilters}
                    style={{
                        ...styles.applyFiltersBtn,
                        background: 'transparent',
                        color: '#6B7280',
                        border: '1px solid #E5E7EB',
                        marginTop: '12px'
                    }}
                >
                    Clear All
                </button>
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

                        {/* Bio Generation Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>Tailored Job Bio</div>
                                {!generatedBio && (
                                    <button
                                        onClick={handleGenerateBio}
                                        disabled={isGeneratingBio}
                                        style={{
                                            ...styles.actionBtn,
                                            padding: '8px 16px',
                                            background: isGeneratingBio ? '#E5E7EB' : '#E6CFA6',
                                            color: isGeneratingBio ? '#9CA3AF' : '#3A4B41',
                                            fontSize: '13px'
                                        }}
                                    >
                                        <Wand2 size={14} />
                                        {isGeneratingBio ? 'Generating...' : 'Auto-Generate with AI'}
                                    </button>
                                )}
                            </div>
                            
                            {bioError && (
                                <div style={{ padding: '12px', background: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
                                    {bioError}
                                </div>
                            )}

                            {(generatedBio || isGeneratingBio) && (
                                <textarea
                                    value={generatedBio}
                                    onChange={(e) => setGeneratedBio(e.target.value)}
                                    placeholder={isGeneratingBio ? "Analyzing your resume and the job description to write the perfect bio..." : "Your tailored professional bio will appear here to be included with your application."}
                                    disabled={isGeneratingBio}
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #E5E7EB',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        color: '#374151',
                                        resize: 'vertical',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            )}
                            {generatedBio && !isGeneratingBio && (
                                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <span>{generatedBio.split(' ').filter(w => w.length > 0).length} words</span>
                                    <button 
                                        onClick={handleGenerateBio}
                                        style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                                    >
                                        Regenerate
                                    </button>
                                </div>
                            )}
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

            {/* Success Animation Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(58, 75, 65, 0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000,
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: '#E6CFA6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                boxShadow: '0 0 50px rgba(230, 207, 166, 0.4)',
                            }}
                        >
                            <Check size={64} color="#3A4B41" strokeWidth={4} />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                fontFamily: "'Bebas Neue', sans-serif",
                                fontSize: '4rem',
                                color: '#E6CFA6',
                                letterSpacing: '2px',
                                margin: 0,
                                textAlign: 'center'
                            }}
                        >
                            APPLICATION SUBMITTED!
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                color: 'rgba(230, 207, 166, 0.8)',
                                fontSize: '1.25rem',
                                marginTop: '12px',
                                textAlign: 'center',
                                maxWidth: '80%'
                            }}
                        >
                            Your application has been delivered to the hiring team.
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.05, background: '#E6CFA6', color: '#3A4B41' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSuccess(false)}
                            style={{
                                marginTop: '48px',
                                padding: '14px 40px',
                                background: 'transparent',
                                border: '2px solid #E6CFA6',
                                color: '#E6CFA6',
                                borderRadius: '100px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                letterSpacing: '0.5px'
                            }}
                        >
                            BACK TO DASHBOARD
                        </motion.button>
                        
                        {/* Decorative flying papers */}
                        <motion.div
                            initial={{ x: -100, y: 100, opacity: 0 }}
                            animate={{ x: 500, y: -500, opacity: 1 }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            style={{ position: 'absolute', left: '20%', bottom: '20%', color: 'rgba(230, 207, 166, 0.2)', pointerEvents: 'none' }}
                        >
                            <Send size={40} />
                        </motion.div>
                        <motion.div
                            initial={{ x: 100, y: 100, opacity: 0 }}
                            animate={{ x: -500, y: -500, opacity: 1 }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5 }}
                            style={{ position: 'absolute', right: '25%', bottom: '15%', color: 'rgba(230, 207, 166, 0.15)', pointerEvents: 'none' }}
                        >
                            <Send size={32} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
