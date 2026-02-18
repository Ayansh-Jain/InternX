import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const styles = {
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 0',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(58, 75, 65, 0.1)',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E6CFA6',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '18px',
        fontWeight: 'bold',
    },
    logoText: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '36px',
        color: '#3A4B41',
        letterSpacing: '2px',
    },
    desktopNav: {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
    },
    navLink: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#4B5563',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        position: 'relative',
    },
    navLinkActive: {
        color: '#3A4B41',
    },
    ctaButton: {
        padding: '14px 28px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        color: '#E6CFA6',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    authButton: {
        padding: '12px 24px',
        background: 'transparent',
        color: '#3A4B41',
        border: '2px solid #3A4B41',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
    },
    userMenu: {
        position: 'relative',
    },
    userButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        background: '#F3F4F6',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
    },
    userAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E6CFA6',
        fontSize: '14px',
        fontWeight: '600',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '8px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        minWidth: '200px',
        overflow: 'hidden',
        zIndex: 200,
    },
    dropdownHeader: {
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
    },
    dropdownName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#3A4B41',
    },
    dropdownEmail: {
        fontSize: '12px',
        color: '#6B7280',
        marginTop: '2px',
    },
    dropdownRole: {
        display: 'inline-block',
        marginTop: '8px',
        padding: '2px 8px',
        background: '#E0E7FF',
        color: '#4F46E5',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
    },
    dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        fontSize: '14px',
        color: '#374151',
        textDecoration: 'none',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        width: '100%',
        textAlign: 'left',
    },
    dropdownItemDanger: {
        color: '#DC2626',
    },
    mobileMenuButton: {
        display: 'none',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
    },
    hamburgerLine: {
        width: '24px',
        height: '2px',
        background: '#3A4B41',
        borderRadius: '2px',
        transition: 'all 0.3s ease',
    },
    mobileMenu: {
        position: 'fixed',
        top: '73px',
        left: 0,
        right: 0,
        background: 'white',
        padding: '24px',
        borderBottom: '1px solid rgba(58, 75, 65, 0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    },
    mobileNavLink: {
        display: 'block',
        padding: '16px 0',
        fontSize: '18px',
        fontWeight: '500',
        color: '#374151',
        textDecoration: 'none',
        borderBottom: '1px solid #E5E7EB',
    },
    mobileCta: {
        display: 'block',
        width: '100%',
        marginTop: '16px',
        padding: '16px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        color: '#E6CFA6',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        textAlign: 'center',
        textDecoration: 'none',
    },
}

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    // Use auth context
    let auth = { user: null, isAuthenticated: false, logout: () => { }, getRedirectPath: () => '/' }
    try {
        auth = useAuth()
    } catch (e) {
        // Auth context not available (on pages without AuthProvider wrapper)
    }

    const { user, isAuthenticated, logout, getRedirectPath } = auth

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/builder', label: 'Build Resume' },
    ]

    const handleLogout = async () => {
        await logout()
        setIsDropdownOpen(false)
        navigate('/signin')
    }

    const handleDashboard = () => {
        const path = getRedirectPath()
        setIsDropdownOpen(false)
        navigate(path)
    }

    const getUserInitials = () => {
        if (!user?.profile?.fullName) return 'U'
        const names = user.profile.fullName.split(' ')
        return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getRoleBadge = () => {
        switch (user?.role) {
            case 'ADMIN': return { label: 'Admin', bg: '#FEE2E2', color: '#DC2626' }
            case 'JOB_PROVIDER': return { label: 'Employer', bg: '#DBEAFE', color: '#2563EB' }
            case 'JOB_SEARCHER': return { label: 'Job Seeker', bg: '#D1FAE5', color: '#059669' }
            default: return { label: 'User', bg: '#F3F4F6', color: '#6B7280' }
        }
    }

    return (
        <motion.nav
            style={styles.nav}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    <div style={styles.logoIcon}>IX</div>
                    <span style={styles.logoText}>INTERNX</span>
                </Link>

                {/* Desktop Navigation */}
                <div style={styles.desktopNav} className="desktop-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            style={{
                                ...styles.navLink,
                                ...(location.pathname === link.path ? styles.navLinkActive : {}),
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {isAuthenticated ? (
                        <div style={styles.userMenu}>
                            <motion.button
                                style={styles.userButton}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={styles.userAvatar}>{getUserInitials()}</div>
                                {user?.profile?.fullName?.split(' ')[0] || 'User'}
                            </motion.button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        style={styles.dropdown}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <div style={styles.dropdownHeader}>
                                            <div style={styles.dropdownName}>{user?.profile?.fullName}</div>
                                            <div style={styles.dropdownEmail}>{user?.email}</div>
                                            <span style={{
                                                ...styles.dropdownRole,
                                                background: getRoleBadge().bg,
                                                color: getRoleBadge().color
                                            }}>
                                                {getRoleBadge().label}
                                            </span>
                                        </div>
                                        <button style={styles.dropdownItem} onClick={handleDashboard}>
                                            <Settings size={16} />
                                            Dashboard
                                        </button>
                                        <button style={styles.dropdownItem} onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}>
                                            <User size={16} />
                                            My Profile
                                        </button>
                                        <button
                                            style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            <Link to="/signin" style={styles.authButton}>
                                Sign In
                            </Link>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/signup" style={styles.ctaButton}>
                                    Get Started <ArrowRight size={18} />
                                </Link>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    style={styles.mobileMenuButton}
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <motion.div
                            style={styles.hamburgerLine}
                            animate={{
                                rotate: isMobileMenuOpen ? 45 : 0,
                                y: isMobileMenuOpen ? 7 : 0,
                            }}
                        />
                        <motion.div
                            style={styles.hamburgerLine}
                            animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                        />
                        <motion.div
                            style={styles.hamburgerLine}
                            animate={{
                                rotate: isMobileMenuOpen ? -45 : 0,
                                y: isMobileMenuOpen ? -7 : 0,
                            }}
                        />
                    </div>
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        style={styles.mobileMenu}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="mobile-menu"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={styles.mobileNavLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={getRedirectPath()}
                                    style={styles.mobileNavLink}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    style={{ ...styles.mobileCta, background: '#FEE2E2', color: '#DC2626' }}
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/signin"
                                    style={styles.mobileNavLink}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    style={styles.mobileCta}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
        </motion.nav>
    )
}

export default Navbar
