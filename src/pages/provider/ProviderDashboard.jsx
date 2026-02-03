/**
 * Job Provider Dashboard - For employers to manage jobs and view applicants.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase, Plus, Edit, Trash2, Users, Eye, Clock,
    MapPin, DollarSign, Calendar, LogOut, ChevronRight,
    Building, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { jobsAPI, profileAPI } from '../../services/api';
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

    useEffect(() => {
        loadJobs();
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

    const totalViews = jobs.reduce((sum, j) => sum + (j.stats?.views || 0), 0);
    const totalApplications = jobs.reduce((sum, j) => sum + (j.stats?.applications || 0), 0);
    const activeJobs = jobs.filter(j => j.status === 'active').length;

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
