import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Twitter, Linkedin, Github } from 'lucide-react'

const styles = {
    footer: {
        background: 'linear-gradient(180deg, #FAFAFA 0%, #F3F4F6 100%)',
        borderTop: '1px solid #E5E7EB',
        padding: '64px 0 32px',
        marginTop: 'auto',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '48px',
        marginBottom: '48px',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
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
        fontWeight: 'bold',
    },
    logoText: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '32px',
        color: '#3A4B41',
        letterSpacing: '2px',
    },
    description: {
        fontSize: '18px',
        color: '#6B7280',
        lineHeight: '1.7',
        maxWidth: '350px',
    },
    heading: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '18px',
        fontWeight: '700',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    link: {
        fontSize: '18px',
        color: '#6B7280',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        display: 'inline-block',
    },
    linkHover: {
        color: '#3A4B41',
    },
    divider: {
        height: '1px',
        background: '#E5E7EB',
        margin: '32px 0',
    },
    bottom: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
    },
    copyright: {
        fontSize: '14px',
        color: '#9CA3AF',
    },
    socialLinks: {
        display: 'flex',
        gap: '16px',
    },
    socialIcon: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6B7280',
        transition: 'all 0.2s ease',
        fontSize: '14px',
    },
}

function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        product: [
            { label: 'Build Resume', path: '/builder' },
            { label: 'Templates', path: '/builder' },
            { label: 'ATS Score', path: '/builder' },
        ],
        resources: [
            { label: 'Resume Tips', path: '#' },
            { label: 'Cover Letters', path: '#' },
            { label: 'Interview Prep', path: '#' },
        ],
        company: [
            { label: 'About Us', path: '#' },
            { label: 'Privacy Policy', path: '#' },
            { label: 'Terms of Service', path: '#' },
        ],
    }

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.grid}>
                    {/* Brand Column */}
                    <div style={styles.column}>
                        <div style={styles.logo}>
                            <div style={styles.logoIcon}>IX</div>
                            <span style={styles.logoText}>INTERNX</span>
                        </div>
                        <p style={styles.description}>
                            Create ATS-perfect resumes in minutes. Built for students, internships, and freshers to land their dream jobs.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div style={styles.column}>
                        <h4 style={styles.heading}>Product</h4>
                        {footerLinks.product.map((link) => (
                            <motion.div
                                key={link.label}
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link to={link.path} style={styles.link}>
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Resources Links */}
                    <div style={styles.column}>
                        <h4 style={styles.heading}>Resources</h4>
                        {footerLinks.resources.map((link) => (
                            <motion.div
                                key={link.label}
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link to={link.path} style={styles.link}>
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Company Links */}
                    <div style={styles.column}>
                        <h4 style={styles.heading}>Company</h4>
                        {footerLinks.company.map((link) => (
                            <motion.div
                                key={link.label}
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link to={link.path} style={styles.link}>
                                    {link.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div style={styles.divider} />

                <div style={styles.bottom}>
                    <p style={styles.copyright}>
                        © {currentYear} InternX. All rights reserved.
                    </p>
                    <div style={styles.socialLinks}>
                        <motion.a
                            href="#"
                            style={styles.socialIcon}
                            whileHover={{ scale: 1.1, background: '#E6CFA6' }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Twitter"
                        >
                            <Twitter size={18} />
                        </motion.a>
                        <motion.a
                            href="#"
                            style={styles.socialIcon}
                            whileHover={{ scale: 1.1, background: '#E6CFA6' }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={18} />
                        </motion.a>
                        <motion.a
                            href="#"
                            style={styles.socialIcon}
                            whileHover={{ scale: 1.1, background: '#E6CFA6' }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="GitHub"
                        >
                            <Github size={18} />
                        </motion.a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
