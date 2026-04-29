/**
 * Job Provider Dashboard - For employers to manage jobs and view applicants.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Plus, Edit, Trash2, Users, Eye, Clock,
    MapPin, DollarSign, Calendar, LogOut, ChevronRight,
    Building, AlertCircle, FileText, User, Mail, Phone,
    Linkedin, Github, ExternalLink, CheckCircle, XCircle,
    ChevronDown, ChevronUp, X, Star, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsAPI, applicationsAPI, profileAPI } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import CustomizedResumePreview from '../../components/CustomizedResumePreview';

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
        background: '#2563EB',
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
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    title: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '32px',
        color: '#3A4B41',
        letterSpacing: '1px',
    },
    primaryBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        color: '#E6CFA6',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'none',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
    },
    statCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#3A4B41',
    },
    statLabel: {
        fontSize: '13px',
        color: '#6B7280',
        marginTop: '4px',
    },
    section: {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    sectionTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '20px',
        color: '#3A4B41',
        letterSpacing: '1px',
        marginBottom: '20px',
    },
    jobCard: {
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
    jobStats: {
        display: 'flex',
        gap: '24px',
        padding: '12px 0',
        borderTop: '1px solid #F3F4F6',
    },
    jobStat: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#6B7280',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
    },
    actionBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginRight: '8px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#6B7280',
    },
    emptyIcon: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
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
        padding: '0',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalHeader: {
        padding: '24px',
        borderBottom: '1px solid #E5E7EB',
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#3A4B41',
    },
    modalBody: {
        padding: '24px',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '6px',
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        fontSize: '14px',
        border: '2px solid #E5E7EB',
        borderRadius: '8px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '12px 14px',
        fontSize: '14px',
        border: '2px solid #E5E7EB',
        borderRadius: '8px',
        outline: 'none',
        minHeight: '100px',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '12px 14px',
        fontSize: '14px',
        border: '2px solid #E5E7EB',
        borderRadius: '8px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    modalFooter: {
        padding: '16px 24px',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
    },
};

function ProviderDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        required_skills: '',
        required_experience: '0-1 years',
        employment_type: 'full-time',
        location: '',
        salary_min: '',
        salary_max: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // Applications Received state
    const [applications, setApplications] = useState([]);
    const [appsLoading, setAppsLoading] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [appFilter, setAppFilter] = useState('all');
    const [expandedResumeId, setExpandedResumeId] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [viewingResume, setViewingResume] = useState(null);

    useEffect(() => {
        loadJobs();
        loadApplications();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const response = await jobsAPI.myJobs({ limit: 50 });
            setJobs(response.data.jobs);
        } catch (err) {
            console.error('Failed to load jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadApplications = async () => {
        setAppsLoading(true);
        try {
            const response = await applicationsAPI.list({ limit: 100 });
            // Now enrich each application with full applicant details
            const apps = response.data.applications || [];

            // For each application, fetch applicants from the job endpoint for richer data
            const enrichedApps = [];
            const jobApplicantsCache = {};

            for (const app of apps) {
                try {
                    if (!jobApplicantsCache[app.job_id]) {
                        const res = await jobsAPI.getApplicants(app.job_id, { limit: 100 });
                        const applicantsMap = {};
                        for (const a of (res.data.applicants || [])) {
                            applicantsMap[a.id] = a;
                        }
                        jobApplicantsCache[app.job_id] = applicantsMap;
                    }
                    const enriched = jobApplicantsCache[app.job_id]?.[app.id];
                    enrichedApps.push({
                        ...app,
                        ...(enriched || {}),
                        // Keep original app fields as priority
                        id: app.id,
                        job_title: app.job_title,
                        job_company: app.job_company,
                    });
                } catch {
                    enrichedApps.push(app);
                }
            }

            setApplications(enrichedApps);
        } catch (err) {
            console.error('Failed to load applications:', err);
        } finally {
            setAppsLoading(false);
        }
    };

    const handleUpdateAppStatus = async (appId, newStatus) => {
        setUpdatingStatus(appId);
        try {
            await applicationsAPI.updateStatus(appId, newStatus);
            setApplications(prev => prev.map(a =>
                a.id === appId ? { ...a, status: newStatus } : a
            ));
            if (selectedApp?.id === appId) {
                setSelectedApp(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const filteredApplications = appFilter === 'all'
        ? applications
        : applications.filter(a => a.status === appFilter);

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            required_skills: '',
            required_experience: '0-1 years',
            employment_type: 'full-time',
            location: '',
            salary_min: '',
            salary_max: '',
        });
        setEditingJob(null);
    };

    const handleOpenForm = (job = null) => {
        if (job) {
            setEditingJob(job);
            setFormData({
                title: job.title,
                description: job.description,
                required_skills: job.required_skills.join(', '),
                required_experience: job.required_experience,
                employment_type: job.employment_type,
                location: job.location,
                salary_min: job.salary_range?.min || '',
                salary_max: job.salary_range?.max || '',
            });
        } else {
            resetForm();
        }
        setShowJobForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const jobData = {
            title: formData.title,
            description: formData.description,
            required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
            required_experience: formData.required_experience,
            employment_type: formData.employment_type,
            location: formData.location,
            salary_range: formData.salary_min || formData.salary_max ? {
                min: parseInt(formData.salary_min) || 0,
                max: parseInt(formData.salary_max) || 0,
                currency: 'INR'
            } : null
        };

        try {
            if (editingJob) {
                await jobsAPI.update(editingJob.id, jobData);
            } else {
                await jobsAPI.create(jobData);
            }
            await loadJobs();
            setShowJobForm(false);
            resetForm();
        } catch (err) {
            console.error('Failed to save job:', err);
            alert('Failed to save job. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            await jobsAPI.delete(jobId);
            setJobs(jobs.filter(j => j.id !== jobId));
        } catch (err) {
            console.error('Failed to delete job:', err);
            alert('Failed to delete job');
        }
    };

    const [predicting, setPredicting] = useState(false);
    const [audienceData, setAudienceData] = useState(null);

    const handlePredictAudience = async () => {
        if (!formData.title || !formData.description) {
            alert("Please enter a job title and description first.");
            return;
        }

        setPredicting(true);
        setAudienceData(null);
        try {
            // Manually calling the endpoint since it might not be in jobsAPI yet
            // Assuming jobsAPI uses an axios instance or similar, but here we can use fetch/axios directly or extend api.js
            // Let's assume we need to extend api.js, but for now I'll use the existing API structure if possible or direct fetch
            // But to be consistent, I should check api.js. 
            // Since I can't check api.js right now easily without breaking flow, I'll assume I need to add it there too.
            // Wait, I should add it to api.js first. But I can't edit api.js in this tool call.
            // I'll make a direct fetch call for now using the token from auth context or similar, 
            // OR better, I'll update api.js in the next step and assume it exists here.

            // Actually, I'll just add the call here assuming `jobsAPI.predictMarket` will be added.
            const response = await jobsAPI.predictMarket({
                title: formData.title,
                description: formData.description
            });
            setAudienceData(response.data);
        } catch (err) {
            console.error("Failed to predict audience:", err);
            alert("Failed to predict audience. Please try again.");
        } finally {
            setPredicting(false);
        }
    };

    const totalViews = jobs.reduce((sum, j) => sum + (j.stats?.views || 0), 0);
    const totalApplications = jobs.reduce((sum, j) => sum + (j.stats?.applications || 0), 0);
    const activeJobs = jobs.filter(j => j.status === 'active').length;

    const getStatusColor = (st) => {
        switch (st) {
            case 'pending': return { bg: '#FEF3C7', color: '#D97706', label: 'Pending' };
            case 'reviewed': return { bg: '#DBEAFE', color: '#2563EB', label: 'Reviewed' };
            case 'shortlisted': return { bg: '#D1FAE5', color: '#059669', label: 'Shortlisted' };
            case 'rejected': return { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' };
            case 'withdrawn': return { bg: '#F3F4F6', color: '#6B7280', label: 'Withdrawn' };
            default: return { bg: '#F3F4F6', color: '#6B7280', label: st };
        }
    };

    const renderResumeSection = (resume) => {
        if (!resume) return <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No resume data available</p>;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resume.summary && (
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>Summary</div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>{resume.summary}</p>
                    </div>
                )}
                {resume.skills && (
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>Skills</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {[...(resume.skills?.technical || []), ...(resume.skills?.tools || [])].map((s, i) => (
                                <span key={i} style={{
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                                    background: '#E0E7FF', color: '#4338CA', fontWeight: '500'
                                }}>{s}</span>
                            ))}
                            {(resume.skills?.soft || []).map((s, i) => (
                                <span key={`soft-${i}`} style={{
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                                    background: '#FCE7F3', color: '#BE185D', fontWeight: '500'
                                }}>{s}</span>
                            ))}
                        </div>
                    </div>
                )}
                {resume.experience && resume.experience.length > 0 && (
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>Experience</div>
                        {resume.experience.map((exp, i) => (
                            <div key={i} style={{ padding: '8px 0', borderBottom: i < resume.experience.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>{exp.title || exp.role}</div>
                                <div style={{ fontSize: '13px', color: '#6B7280' }}>{exp.company} {exp.duration ? `· ${exp.duration}` : ''}</div>
                            </div>
                        ))}
                    </div>
                )}
                {resume.education && resume.education.length > 0 && (
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>Education</div>
                        {resume.education.map((edu, i) => (
                            <div key={i} style={{ padding: '4px 0' }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>{edu.degree}</div>
                                <div style={{ fontSize: '13px', color: '#6B7280' }}>{edu.institution} {edu.year ? `· ${edu.year}` : ''}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
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
                    <span style={styles.badge}>EMPLOYER</span>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.profile?.fullName || 'Provider'}</div>
                        <div style={styles.userRole}>{user?.profile?.company || user?.email}</div>
                    </div>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            <div style={styles.container}>
                <div style={styles.pageHeader}>
                    <h1 style={styles.title}>My Job Postings</h1>
                    <motion.button
                        style={styles.primaryBtn}
                        onClick={() => handleOpenForm()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={18} />
                        Post New Job
                    </motion.button>
                </div>

                {/* Stats */}
                <div style={styles.statsGrid}>
                    <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                        <div style={styles.statValue}>{jobs.length}</div>
                        <div style={styles.statLabel}>Total Jobs Posted</div>
                    </motion.div>
                    <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                        <div style={styles.statValue}>{activeJobs}</div>
                        <div style={styles.statLabel}>Active Jobs</div>
                    </motion.div>
                    <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                        <div style={styles.statValue}>{totalViews}</div>
                        <div style={styles.statLabel}>Total Views</div>
                    </motion.div>
                    <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                        <div style={styles.statValue}>{totalApplications}</div>
                        <div style={styles.statLabel}>Total Applications</div>
                    </motion.div>
                </div>

                {/* Jobs List */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Your Jobs</h2>

                    {loading ? (
                        <div style={styles.loading}>
                            <div style={styles.spinner} />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <Briefcase size={28} color="#9CA3AF" />
                            </div>
                            <h3 style={{ marginBottom: '8px', color: '#374151' }}>No jobs posted yet</h3>
                            <p style={{ marginBottom: '20px' }}>Create your first job posting to start receiving applications.</p>
                            <button style={styles.primaryBtn} onClick={() => handleOpenForm()}>
                                <Plus size={18} /> Post Your First Job
                            </button>
                        </div>
                    ) : (
                        jobs.map(job => (
                            <motion.div
                                key={job.id}
                                style={styles.jobCard}
                                whileHover={{ borderColor: '#3A4B41' }}
                            >
                                <div style={styles.jobHeader}>
                                    <div>
                                        <h3 style={styles.jobTitle}>{job.title}</h3>
                                        <span style={{
                                            ...styles.statusBadge,
                                            background: job.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                                            color: job.status === 'active' ? '#059669' : '#DC2626'
                                        }}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div>
                                        <button
                                            style={{ ...styles.actionBtn, background: '#E0E7FF', color: '#4F46E5' }}
                                            onClick={() => handleOpenForm(job)}
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            style={{ ...styles.actionBtn, background: '#FEE2E2', color: '#DC2626' }}
                                            onClick={() => handleDeleteJob(job.id)}
                                        >
                                            <Trash2 size={14} /> Delete
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

                                <div style={styles.jobStats}>
                                    <span style={styles.jobStat}>
                                        <Eye size={14} /> {job.stats?.views || 0} views
                                    </span>
                                    <span style={styles.jobStat}>
                                        <Users size={14} /> {job.stats?.applications || 0} applications
                                    </span>
                                    <span style={styles.jobStat}>
                                        <Calendar size={14} /> Posted {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* ═══ Applications Received Section ═══ */}
                <div style={styles.section}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={styles.sectionTitle}>
                            <FileText size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                            Applications Received
                        </h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['all', 'pending', 'shortlisted', 'rejected'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setAppFilter(f)}
                                    style={{
                                        padding: '6px 14px', borderRadius: '20px', border: 'none',
                                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                        background: appFilter === f ? '#3A4B41' : '#F3F4F6',
                                        color: appFilter === f ? '#E6CFA6' : '#6B7280',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {appsLoading ? (
                        <div style={styles.loading}>
                            <div style={styles.spinner} />
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>
                                <FileText size={28} color="#9CA3AF" />
                            </div>
                            <h3 style={{ marginBottom: '8px', color: '#374151' }}>No applications {appFilter !== 'all' ? `with status "${appFilter}"` : 'received yet'}</h3>
                            <p>Applications from job seekers will appear here.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredApplications.map(app => {
                                const statusInfo = getStatusColor(app.status);
                                const isExpanded = expandedResumeId === app.id;
                                return (
                                    <motion.div
                                        key={app.id}
                                        style={{
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '14px',
                                            overflow: 'hidden',
                                            background: 'white',
                                            transition: 'all 0.2s ease'
                                        }}
                                        whileHover={{ borderColor: '#3A4B41', boxShadow: '0 4px 12px rgba(58,75,65,0.08)' }}
                                    >
                                        {/* Application Header */}
                                        <div style={{
                                            padding: '16px 20px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                            onClick={() => setExpandedResumeId(isExpanded ? null : app.id)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#E6CFA6', fontWeight: '700', fontSize: '16px', flexShrink: 0
                                                }}>
                                                    {(app.applicant_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#1F2937' }}>
                                                        {app.applicant_name || 'Unknown Applicant'}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '2px' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Briefcase size={12} /> {app.job_title || 'Job'}
                                                        </span>
                                                        {app.applicant_email && (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Mail size={12} /> {app.applicant_email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                                <div style={{
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                                                    background: app.match_percentage >= 70 ? '#D1FAE5' : app.match_percentage >= 40 ? '#FEF3C7' : '#FEE2E2',
                                                    color: app.match_percentage >= 70 ? '#059669' : app.match_percentage >= 40 ? '#D97706' : '#DC2626'
                                                }}>
                                                    {app.match_percentage}% Match
                                                </div>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    background: statusInfo.bg,
                                                    color: statusInfo.color
                                                }}>
                                                    {statusInfo.label}
                                                </span>
                                                <div style={{ fontSize: '12px', color: '#9CA3AF', minWidth: '70px', textAlign: 'right' }}>
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </div>
                                                {isExpanded ? <ChevronUp size={18} color="#6B7280" /> : <ChevronDown size={18} color="#6B7280" />}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{
                                                        padding: '0 20px 20px',
                                                        borderTop: '1px solid #F3F4F6'
                                                    }}>

                                                        {app.application_bio && (

                                                            <div style={{
                                                                margin: '16px 0',
                                                                padding: '14px 16px',
                                                                background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                                                                borderRadius: '12px',
                                                                borderLeft: '4px solid #3A4B41'
                                                            }}>
                                                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>

                                                                    <User size={14} /> AI-Tailored Application Bio
                                                                </div>
                                                                <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                                                                    {app.application_bio}
                                                             </p>
                                                            </div>
                                                        )}

                                                        {/* Contact Info Row */}
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '12px 0' }}>
                                                            {app.applicant_phone && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280', background: '#F9FAFB', padding: '6px 12px', borderRadius: '8px' }}>
                                                                    <Phone size={14} /> {app.applicant_phone}
                                                                </span>
                                                            )}
                                                            {app.applicant_location && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280', background: '#F9FAFB', padding: '6px 12px', borderRadius: '8px' }}>
                                                                    <MapPin size={14} /> {app.applicant_location}
                                                                </span>
                                                            )}
                                                            {app.applicant_linkedin && (
                                                                <a href={app.applicant_linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#2563EB', background: '#EFF6FF', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>
                                                                    <Linkedin size={14} /> LinkedIn
                                                                </a>
                                                            )}
                                                            {app.applicant_github && (
                                                                <a href={app.applicant_github} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', background: '#F3F4F6', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none' }}>
                                                                    <Github size={14} /> GitHub
                                                                </a>
                                                            )}
                                                        </div>

                                                        {/* Cover Letter */}
                                                        {app.cover_letter && (
                                                            <div style={{ margin: '12px 0', padding: '14px 16px', background: '#FFFBEB', borderRadius: '12px', borderLeft: '4px solid #D97706' }}>
                                                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400E', textTransform: 'uppercase', marginBottom: '6px' }}>Cover Letter</div>
                                                                <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                                                    {app.cover_letter}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Resume Data */}
                                                        <div style={{ margin: '12px 0', padding: '14px 16px', background: '#F0FDF4', borderRadius: '12px', borderLeft: '4px solid #059669' }}>
                                                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#065F46', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <FileText size={14} /> Resume Details
                                                            </div>
                                                            {renderResumeSection(app.resume_snapshot)}

                                                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    onClick={() => setViewingResume(app.resume_snapshot)}
                                                                    style={{
                                                                        background: '#059669', color: 'white', border: 'none',
                                                                        padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                                                    }}
                                                                >
                                                                    <Eye size={14} /> View Full Resume
                                                                </button>
                                                            </div>

                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
                                                            {app.status !== 'shortlisted' && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.03 }}
                                                                    whileTap={{ scale: 0.97 }}
                                                                    style={{
                                                                        ...styles.actionBtn,
                                                                        background: '#D1FAE5', color: '#059669',
                                                                        opacity: updatingStatus === app.id ? 0.6 : 1
                                                                    }}
                                                                    disabled={updatingStatus === app.id}
                                                                    onClick={(e) => { e.stopPropagation(); handleUpdateAppStatus(app.id, 'shortlisted'); }}
                                                                >
                                                                    <CheckCircle size={14} /> Shortlist
                                                                </motion.button>
                                                            )}
                                                            {app.status !== 'rejected' && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.03 }}
                                                                    whileTap={{ scale: 0.97 }}
                                                                    style={{
                                                                        ...styles.actionBtn,
                                                                        background: '#FEE2E2', color: '#DC2626',
                                                                        opacity: updatingStatus === app.id ? 0.6 : 1
                                                                    }}
                                                                    disabled={updatingStatus === app.id}
                                                                    onClick={(e) => { e.stopPropagation(); handleUpdateAppStatus(app.id, 'rejected'); }}
                                                                >
                                                                    <XCircle size={14} /> Reject
                                                                </motion.button>
                                                            )}
                                                            {app.status !== 'reviewed' && app.status === 'pending' && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.03 }}
                                                                    whileTap={{ scale: 0.97 }}
                                                                    style={{
                                                                        ...styles.actionBtn,
                                                                        background: '#DBEAFE', color: '#2563EB',
                                                                        opacity: updatingStatus === app.id ? 0.6 : 1
                                                                    }}
                                                                    disabled={updatingStatus === app.id}
                                                                    onClick={(e) => { e.stopPropagation(); handleUpdateAppStatus(app.id, 'reviewed'); }}
                                                                >
                                                                    <Eye size={14} /> Mark Reviewed
                                                                </motion.button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Job Form Modal */}
            {showJobForm && (
                <div style={styles.modal} onClick={() => setShowJobForm(false)}>
                    <motion.div
                        style={styles.modalContent}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {editingJob ? 'Edit Job' : 'Post New Job'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.modalBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Job Title *</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Frontend Developer"
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Description *</label>
                                    <textarea
                                        style={styles.textarea}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the role, responsibilities, and requirements..."
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Required Skills (comma separated)</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={formData.required_skills}
                                        onChange={e => setFormData({ ...formData, required_skills: e.target.value })}
                                        placeholder="e.g. React, Node.js, TypeScript"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Experience Required</label>
                                        <select
                                            style={styles.select}
                                            value={formData.required_experience}
                                            onChange={e => setFormData({ ...formData, required_experience: e.target.value })}
                                        >
                                            <option value="0-1 years">0-1 years (Fresher)</option>
                                            <option value="1-2 years">1-2 years</option>
                                            <option value="2-4 years">2-4 years</option>
                                            <option value="4-6 years">4-6 years</option>
                                            <option value="6+ years">6+ years</option>
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Employment Type</label>
                                        <select
                                            style={styles.select}
                                            value={formData.employment_type}
                                            onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                                        >
                                            <option value="full-time">Full-time</option>
                                            <option value="part-time">Part-time</option>
                                            <option value="remote">Remote</option>
                                            <option value="contract">Contract</option>
                                            <option value="internship">Internship</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Location</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. Bangalore, India or Remote"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Salary Min (₹)</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            value={formData.salary_min}
                                            onChange={e => setFormData({ ...formData, salary_min: e.target.value })}
                                            placeholder="e.g. 500000"
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Salary Max (₹)</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            value={formData.salary_max}
                                            onChange={e => setFormData({ ...formData, salary_max: e.target.value })}
                                            placeholder="e.g. 1000000"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button
                                    type="button"
                                    style={{ ...styles.actionBtn, background: '#E0E7FF', color: '#4F46E5', marginRight: 'auto' }}
                                    onClick={handlePredictAudience}
                                    disabled={predicting}
                                >
                                    {predicting ? 'Analyzing...' : 'Preview Audience'}
                                </button>
                                <button
                                    type="button"
                                    style={{ ...styles.actionBtn, background: '#F3F4F6', color: '#374151' }}
                                    onClick={() => setShowJobForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ ...styles.primaryBtn, opacity: submitting ? 0.7 : 1 }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : (editingJob ? 'Update Job' : 'Post Job')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Audience Prediction Modal */}
            {audienceData && (
                <div style={styles.modal} onClick={() => setAudienceData(null)}>
                    <motion.div
                        style={styles.modalContent}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Market Audience Prediction</h2>
                        </div>
                        <div style={styles.modalBody}>
                            <p style={{ marginBottom: '20px', color: '#6B7280' }}>
                                Based on your job description, here is the predicted distribution of interested candidates:
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {Object.entries(audienceData).map(([level, percentage]) => (
                                    <div key={level}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{level.replace('_', ' ')}</span>
                                            <span style={{ fontWeight: '600' }}>{(percentage * 100).toFixed(0)}%</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '10px',
                                            background: '#F3F4F6',
                                            borderRadius: '5px',
                                            overflow: 'hidden'
                                        }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                style={{
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #3A4B41 0%, #4A5D52 100%)',
                                                    borderRadius: '5px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '30px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', borderLeft: '4px solid #3A4B41' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#3A4B41' }}>Insight</h4>
                                <p style={{ margin: 0, fontSize: '14px', color: '#4B5563' }}>
                                    {audienceData.students > 0.5
                                        ? "This role is highly attractive to students and fresh graduates. Expect a high volume of entry-level applications."
                                        : audienceData.senior_level > 0.3
                                            ? "This role appeals to experienced professionals. You may receive fewer but higher-quality applications."
                                            : "This role has a balanced appeal across different experience levels."
                                    }
                                </p>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                type="button"
                                style={styles.primaryBtn}
                                onClick={() => setAudienceData(null)}
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Resume Viewer Modal */}
            {viewingResume && (
                <div style={{
                    ...styles.modal,
                    background: 'rgba(0,0,0,0.8)'
                }} onClick={() => setViewingResume(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            ...styles.modalContent,
                            maxWidth: '900px',
                            padding: '0',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '16px 24px',
                            background: '#F9FAFB',
                            borderBottom: '1px solid #E5E7EB',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#1F2937' }}>
                                Resume Preview
                            </h3>
                            <button
                                onClick={() => setViewingResume(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{
                            padding: '24px',
                            overflowY: 'auto',
                            maxHeight: 'calc(90vh - 120px)',
                            background: '#F3F4F6'
                        }}>
                            <div style={{
                                maxWidth: '800px',
                                margin: '0 auto',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <CustomizedResumePreview data={viewingResume} rawData={viewingResume} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                input:focus, textarea:focus, select:focus {
                    border-color: #3A4B41 !important;
                }
            `}</style>
        </div>
    );
}

export default ProviderDashboard;
