/**
 * Admin Dashboard - Full system access for administrators.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Briefcase, Shield, TrendingUp, Ban, Trash2,
    CheckCircle, AlertCircle, Search, RefreshCw, Eye,
    UserCheck, UserX, LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
        background: '#DC2626',
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
        maxWidth: '1400px',
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
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
    },
    statCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    statIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
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
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    sectionTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '20px',
        color: '#3A4B41',
        letterSpacing: '1px',
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: '#F9FAFB',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '14px',
        width: '200px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '12px 16px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        borderBottom: '1px solid #E5E7EB',
    },
    td: {
        padding: '16px',
        borderBottom: '1px solid #F3F4F6',
        fontSize: '14px',
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
    actionBtn: {
        padding: '6px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        marginRight: '8px',
    },
    tabs: {
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
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
    },
    tabActive: {
        background: '#3A4B41',
        color: '#E6CFA6',
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
        maxWidth: '400px',
        width: '90%',
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#3A4B41',
    },
    modalText: {
        fontSize: '14px',
        color: '#6B7280',
        marginBottom: '24px',
    },
    modalButtons: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
    },
};

function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmModal, setConfirmModal] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, usersRes, jobsRes] = await Promise.all([
                adminAPI.getAnalytics(),
                adminAPI.listUsers({ limit: 50 }),
                adminAPI.listJobs({ limit: 50 })
            ]);
            setAnalytics(analyticsRes.data);
            setUsers(usersRes.data.users);
            setJobs(jobsRes.data.jobs);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, email) => {
        setConfirmModal({
            title: 'Block User',
            message: `Are you sure you want to block ${email}? They will not be able to access the platform.`,
            action: async () => {
                try {
                    await adminAPI.blockUser(userId);
                    setUsers(users.map(u => u.id === userId ? { ...u, status: 'blocked' } : u));
                    setConfirmModal(null);
                } catch (err) {
                    alert('Failed to block user');
                }
            }
        });
    };

    const handleUnblockUser = async (userId) => {
        try {
            await adminAPI.unblockUser(userId);
            setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
        } catch (err) {
            alert('Failed to unblock user');
        }
    };

    const handleDeleteUser = async (userId, email) => {
        setConfirmModal({
            title: 'Delete User',
            message: `Are you sure you want to PERMANENTLY delete ${email}? This action cannot be undone.`,
            action: async () => {
                try {
                    await adminAPI.deleteUser(userId);
                    setUsers(users.filter(u => u.id !== userId));
                    setConfirmModal(null);
                } catch (err) {
                    alert('Failed to delete user');
                }
            }
        });
    };

    const handleBlockJob = async (jobId, title) => {
        setConfirmModal({
            title: 'Block Job',
            message: `Are you sure you want to block "${title}"?`,
            action: async () => {
                try {
                    await adminAPI.blockJob(jobId);
                    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'blocked' } : j));
                    setConfirmModal(null);
                } catch (err) {
                    alert('Failed to block job');
                }
            }
        });
    };

    const handleDeleteJob = async (jobId, title) => {
        setConfirmModal({
            title: 'Delete Job',
            message: `Are you sure you want to permanently delete "${title}"?`,
            action: async () => {
                try {
                    await adminAPI.deleteJob(jobId);
                    setJobs(jobs.filter(j => j.id !== jobId));
                    setConfirmModal(null);
                } catch (err) {
                    alert('Failed to delete job');
                }
            }
        });
    };

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={styles.dashboard}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>IX</div>
                        <span style={styles.logoText}>INTERNX</span>
                    </div>
                    <span style={styles.badge}>ADMIN</span>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.profile?.fullName || 'Admin'}</div>
                        <div style={styles.userRole}>{user?.email}</div>
                    </div>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            <div style={styles.container}>
                <h1 style={styles.title}>Admin Dashboard</h1>

                {/* Analytics Cards */}
                {analytics && (
                    <div style={styles.statsGrid}>
                        <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                            <div style={{ ...styles.statIcon, background: '#DBEAFE' }}>
                                <Users size={20} color="#2563EB" />
                            </div>
                            <div style={styles.statValue}>{analytics.users.total}</div>
                            <div style={styles.statLabel}>Total Users</div>
                        </motion.div>
                        <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                            <div style={{ ...styles.statIcon, background: '#D1FAE5' }}>
                                <UserCheck size={20} color="#059669" />
                            </div>
                            <div style={styles.statValue}>{analytics.users.job_providers}</div>
                            <div style={styles.statLabel}>Job Providers</div>
                        </motion.div>
                        <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                            <div style={{ ...styles.statIcon, background: '#FEF3C7' }}>
                                <TrendingUp size={20} color="#D97706" />
                            </div>
                            <div style={styles.statValue}>{analytics.users.job_searchers}</div>
                            <div style={styles.statLabel}>Job Searchers</div>
                        </motion.div>
                        <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                            <div style={{ ...styles.statIcon, background: '#E0E7FF' }}>
                                <Briefcase size={20} color="#4F46E5" />
                            </div>
                            <div style={styles.statValue}>{analytics.jobs.active}</div>
                            <div style={styles.statLabel}>Active Jobs</div>
                        </motion.div>
                        <motion.div style={styles.statCard} whileHover={{ y: -2 }}>
                            <div style={{ ...styles.statIcon, background: '#FEE2E2' }}>
                                <UserX size={20} color="#DC2626" />
                            </div>
                            <div style={styles.statValue}>{analytics.users.blocked}</div>
                            <div style={styles.statLabel}>Blocked Users</div>
                        </motion.div>
                    </div>
                )}

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'users' ? styles.tabActive : {}) }}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Users
                    </button>
                    <button
                        style={{ ...styles.tab, ...(activeTab === 'jobs' ? styles.tabActive : {}) }}
                        onClick={() => setActiveTab('jobs')}
                    >
                        <Briefcase size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Jobs
                    </button>
                    <button
                        style={styles.tab}
                        onClick={loadData}
                    >
                        <RefreshCw size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Refresh
                    </button>
                </div>

                {/* Content */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            {activeTab === 'users' ? 'User Management' : 'Job Management'}
                        </h2>
                        <div style={styles.searchBox}>
                            <Search size={16} color="#9CA3AF" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>
                            <div style={styles.spinner} />
                        </div>
                    ) : activeTab === 'users' ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>User</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Joined</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '500' }}>{u.profile?.fullName || 'N/A'}</div>
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{u.email}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                background: u.role === 'ADMIN' ? '#FEE2E2' : u.role === 'JOB_PROVIDER' ? '#DBEAFE' : '#D1FAE5',
                                                color: u.role === 'ADMIN' ? '#DC2626' : u.role === 'JOB_PROVIDER' ? '#2563EB' : '#059669'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                background: u.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                                                color: u.status === 'active' ? '#059669' : '#DC2626'
                                            }}>
                                                {u.status === 'active' ? <CheckCircle size={12} /> : <Ban size={12} />}
                                                {u.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={styles.td}>
                                            {u.role !== 'ADMIN' && (
                                                <>
                                                    {u.status === 'active' ? (
                                                        <button
                                                            style={{ ...styles.actionBtn, background: '#FEF3C7', color: '#D97706' }}
                                                            onClick={() => handleBlockUser(u.id, u.email)}
                                                        >
                                                            <Ban size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                            Block
                                                        </button>
                                                    ) : (
                                                        <button
                                                            style={{ ...styles.actionBtn, background: '#D1FAE5', color: '#059669' }}
                                                            onClick={() => handleUnblockUser(u.id)}
                                                        >
                                                            <CheckCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                            Unblock
                                                        </button>
                                                    )}
                                                    <button
                                                        style={{ ...styles.actionBtn, background: '#FEE2E2', color: '#DC2626' }}
                                                        onClick={() => handleDeleteUser(u.id, u.email)}
                                                    >
                                                        <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Job</th>
                                    <th style={styles.th}>Provider</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Stats</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map(j => (
                                    <tr key={j.id}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '500' }}>{j.title}</div>
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{j.location}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div>{j.provider_company || 'N/A'}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                background: j.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                                                color: j.status === 'active' ? '#059669' : '#DC2626'
                                            }}>
                                                {j.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontSize: '12px' }}>
                                                <Eye size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                {j.stats?.views || 0} views
                                            </div>
                                            <div style={{ fontSize: '12px' }}>
                                                {j.stats?.applications || 0} applications
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            {j.status === 'active' && (
                                                <button
                                                    style={{ ...styles.actionBtn, background: '#FEF3C7', color: '#D97706' }}
                                                    onClick={() => handleBlockJob(j.id, j.title)}
                                                >
                                                    <Ban size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                    Block
                                                </button>
                                            )}
                                            <button
                                                style={{ ...styles.actionBtn, background: '#FEE2E2', color: '#DC2626' }}
                                                onClick={() => handleDeleteJob(j.id, j.title)}
                                            >
                                                <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div style={styles.modal} onClick={() => setConfirmModal(null)}>
                    <motion.div
                        style={styles.modalContent}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={styles.modalTitle}>{confirmModal.title}</h3>
                        <p style={styles.modalText}>{confirmModal.message}</p>
                        <div style={styles.modalButtons}>
                            <button
                                style={{ ...styles.actionBtn, background: '#F3F4F6', color: '#374151' }}
                                onClick={() => setConfirmModal(null)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.actionBtn, background: '#DC2626', color: 'white' }}
                                onClick={confirmModal.action}
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;
