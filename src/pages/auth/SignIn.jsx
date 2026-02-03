/**
 * Sign In page.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
        maxWidth: '420px',
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
        marginBottom: '8px',
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
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        margin: '24px 0',
        color: '#9CA3AF',
        fontSize: '13px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        background: '#E5E7EB',
    },
};

function SignIn() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signin, loading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Get redirect path from location state or default
    const from = location.state?.from?.pathname;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setValidationErrors(prev => ({ ...prev, [name]: '' }));
        if (error) clearError();
    };

    const validate = () => {
        const errors = {};
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const user = await signin(formData.email, formData.password);

            // Redirect based on role or previous location
            if (from) {
                navigate(from, { replace: true });
            } else {
                const redirectPath = {
                    'ADMIN': '/admin',
                    'JOB_PROVIDER': '/provider',
                    'JOB_SEARCHER': '/searcher'
                }[user.role] || '/';

                navigate(redirectPath, { replace: true });
            }
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
                    <Link to="/" style={styles.logo}>
                        <div style={styles.logoIcon}>IX</div>
                        <span style={styles.logoText}>INTERNX</span>
                    </Link>

                    <h1 style={styles.title}>Welcome Back</h1>
                    <p style={styles.subtitle}>Sign in to continue to your dashboard</p>

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
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                autoComplete="email"
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
                                autoComplete="current-password"
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
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p style={styles.footer}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={styles.link}>Create one</Link>
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

export default SignIn;
