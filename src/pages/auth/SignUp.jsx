/**
 * Sign Up page with role selection.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        padding: '24px',
    },
    container: {
        width: '100%',
        maxWidth: '480px',
    },
    card: {
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '32px',
    },
    logoIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E6CFA6',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '20px',
        fontWeight: 'bold',
    },
    logoText: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '32px',
        color: '#3A4B41',
        letterSpacing: '2px',
    },
    title: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '28px',
        color: '#3A4B41',
        textAlign: 'center',
        marginBottom: '8px',
        letterSpacing: '1px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: '32px',
    },
    roleSelector: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px',
    },
    roleCard: {
        padding: '20px 16px',
        border: '2px solid #E5E7EB',
        borderRadius: '12px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s ease',
    },
    roleCardActive: {
        borderColor: '#3A4B41',
        background: 'rgba(58, 75, 65, 0.05)',
    },
    roleIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 8px',
    },
    roleTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#3A4B41',
    },
    roleDesc: {
        fontSize: '12px',
        color: '#6B7280',
        marginTop: '4px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    inputGroup: {
        position: 'relative',
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
        padding: '14px 16px',
        fontSize: '15px',
        border: '2px solid #E5E7EB',
        borderRadius: '10px',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        boxSizing: 'border-box',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    passwordToggle: {
        position: 'absolute',
        right: '14px',
        top: '38px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#9CA3AF',
        padding: '4px',
    },
    error: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '10px',
        color: '#DC2626',
        fontSize: '14px',
    },
    button: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        color: '#E6CFA6',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px',
    },
    buttonDisabled: {
        opacity: 0.7,
        cursor: 'not-allowed',
    },
    footer: {
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
        color: '#6B7280',
    },
    link: {
        color: '#3A4B41',
        fontWeight: '600',
        textDecoration: 'none',
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '2px solid rgba(230, 207, 166, 0.3)',
        borderTop: '2px solid #E6CFA6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
};

function SignUp() {
    const navigate = useNavigate();
    const { signup, loading, error, clearError } = useAuth();

    const [role, setRole] = useState('JOB_SEARCHER');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setValidationErrors(prev => ({ ...prev, [name]: '' }));
        if (error) clearError();
    };

    const validate = () => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = 'Name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        if (!formData.password) errors.password = 'Password is required';
        else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const user = await signup(
                formData.email,
                formData.password,
                formData.fullName,
                role
            );

            // Redirect based on role
            const redirectPath = {
                'ADMIN': '/admin',
                'JOB_PROVIDER': '/provider',
                'JOB_SEARCHER': '/searcher'
            }[user.role] || '/';

            navigate(redirectPath);
        } catch (err) {
            // Error is handled by context
        }
    };

    return (
        <div style={styles.page}>
            <motion.div
                style={styles.container}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={styles.card}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>IX</div>
                        <span style={styles.logoText}>INTERNX</span>
                    </div>

                    <h1 style={styles.title}>Create Your Account</h1>
                    <p style={styles.subtitle}>Join InternX and start your journey</p>

                    {/* Role Selection */}
                    <div style={styles.roleSelector}>
                        <motion.div
                            style={{
                                ...styles.roleCard,
                                ...(role === 'JOB_SEARCHER' ? styles.roleCardActive : {})
                            }}
                            onClick={() => setRole('JOB_SEARCHER')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div style={{
                                ...styles.roleIcon,
                                background: role === 'JOB_SEARCHER' ? '#3A4B41' : '#F3F4F6'
                            }}>
                                <User size={20} color={role === 'JOB_SEARCHER' ? '#E6CFA6' : '#6B7280'} />
                            </div>
                            <div style={styles.roleTitle}>Job Searcher</div>
                            <div style={styles.roleDesc}>Find your dream job</div>
                        </motion.div>

                        <motion.div
                            style={{
                                ...styles.roleCard,
                                ...(role === 'JOB_PROVIDER' ? styles.roleCardActive : {})
                            }}
                            onClick={() => setRole('JOB_PROVIDER')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div style={{
                                ...styles.roleIcon,
                                background: role === 'JOB_PROVIDER' ? '#3A4B41' : '#F3F4F6'
                            }}>
                                <Briefcase size={20} color={role === 'JOB_PROVIDER' ? '#E6CFA6' : '#6B7280'} />
                            </div>
                            <div style={styles.roleTitle}>Job Provider</div>
                            <div style={styles.roleDesc}>Post jobs & hire</div>
                        </motion.div>
                    </div>

                    {error && (
                        <motion.div
                            style={styles.error}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.fullName ? styles.inputError : {})
                                }}
                            />
                            {validationErrors.fullName && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                                    {validationErrors.fullName}
                                </span>
                            )}
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.email ? styles.inputError : {})
                                }}
                            />
                            {validationErrors.email && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                                    {validationErrors.email}
                                </span>
                            )}
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={{
                                    ...styles.input,
                                    paddingRight: '48px',
                                    ...(validationErrors.password ? styles.inputError : {})
                                }}
                            />
                            <button
                                type="button"
                                style={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                            {validationErrors.password && (
                                <span style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                                    {validationErrors.password}
                                </span>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : {})
                            }}
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.02 } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                        >
                            {loading ? (
                                <>
                                    <div style={styles.spinner} />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p style={styles.footer}>
                        Already have an account?{' '}
                        <Link to="/signin" style={styles.link}>Sign In</Link>
                    </p>
                </div>
            </motion.div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                input:focus {
                    border-color: #3A4B41 !important;
                }
            `}</style>
        </div>
    );
}

export default SignUp;
