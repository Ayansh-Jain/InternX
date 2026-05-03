import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    FileText,
    Target,
    BarChart3,
    Palette,
    Zap,
    Download,
    ArrowRight,
    UserPen,
    Star,
    Users,
    CheckCircle2
} from 'lucide-react'
import AnimatedButton from '../components/AnimatedButton.jsx'

const styles = {
    landing: {
        paddingTop: '73px',
    },
    hero: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FDF8F0 0%, #F3F4F6 100%)',
    },
    heroBackground: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
    },
    heroBlob1: {
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(230, 207, 166, 0.3) 0%, transparent 70%)',
        filter: 'blur(60px)',
    },
    heroBlob2: {
        position: 'absolute',
        bottom: '-30%',
        left: '-15%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(58, 75, 65, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
    },
    heroBlob3: {
        position: 'absolute',
        top: '20%',
        left: '40%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(230, 207, 166, 0.2) 0%, transparent 70%)',
        filter: 'blur(80px)',
    },
    heroContainer: {
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '84px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
    },
    heroContent: {
        display: 'flex',

        flexDirection: 'column',
        gap: '24px',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(58, 75, 65, 0.08)',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#3A4B41',
        width: 'fit-content',
    },
    badgeDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#10B981',
    },
    heroTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(4rem, 8vw, 6.5rem)',
        minWidth: '900px',
        lineHeight: '1',
        color: '#3A4B41',
        letterSpacing: '2px',
        margin: 0,
    },
    heroTitleAccent: {
        background: 'linear-gradient(135deg, #E6CFA6 0%, #C9A86C 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    heroSubtitle: {
        fontSize: '1.5rem',
        lineHeight: '1.6',
        color: '#6B7280',
        maxWidth: '650px',
    },
    heroCta: {
        display: 'flex',
        gap: '16px',
        marginTop: '16px',
        flexWrap: 'wrap',
    },
    heroStats: {
        display: 'flex',
        gap: '48px',
        marginTop: '32px',
        paddingTop: '32px',
        borderTop: '1px solid #E5E7EB',
    },
    stat: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    statNumber: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2.5rem',
        color: '#3A4B41',
        letterSpacing: '1px',
    },
    statLabel: {
        fontSize: '14px',
        color: '#9CA3AF',
    },
    heroVisual: {
        position: 'relative',
    },
    resumeCard: {
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)',
        transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
    },
    resumeHeader: {
        borderBottom: '2px solid #E5E7EB',
        paddingBottom: '16px',
        marginBottom: '16px',
    },
    resumeName: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.75rem',
        color: '#3A4B41',
        letterSpacing: '1px',
        marginBottom: '4px',
    },
    resumeTitle: {
        fontSize: '14px',
        color: '#6B7280',
    },
    resumeSection: {
        marginBottom: '16px',
    },
    resumeSectionTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1rem',
        color: '#3A4B41',
        letterSpacing: '1px',
        marginBottom: '8px',
        textTransform: 'uppercase',
    },
    resumeLine: {
        height: '8px',
        background: '#F3F4F6',
        borderRadius: '4px',
        marginBottom: '6px',
    },
    resumeLineMedium: {
        width: '80%',
    },
    resumeLineShort: {
        width: '60%',
    },
    scoreOverlay: {
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        color: '#E6CFA6',
        padding: '20px',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(58, 75, 65, 0.4)',
    },
    scoreNumber: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '3rem',
        lineHeight: '1',
    },
    scoreLabel: {
        fontSize: '12px',
        opacity: '0.8',
        marginTop: '4px',
    },
    features: {
        padding: '100px 0',
        background: '#FFFFFF',
    },
    featuresContainer: {
        maxWidth: '1500px',
        margin: '0 auto',
        padding: '0 24px',
    },
    sectionHeader: {
        textAlign: 'center',
        marginBottom: '64px',
    },
    sectionTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        color: '#3A4B41',
        marginBottom: '16px',
        letterSpacing: '2px',
    },
    sectionSubtitle: {
        fontSize: '1.125rem',
        color: '#6B7280',
        maxWidth: '600px',
        margin: '0 auto',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px',
    },
    featureCard: {
        background: '#FAFAFA',
        borderRadius: '16px',
        padding: '32px',
        transition: 'all 0.3s ease',
        border: '1px solid transparent',
    },
    featureIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #E6CFA6 0%, #D4BC8E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3A4B41',
        marginBottom: '20px',
    },
    featureTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2rem',
        color: '#3A4B41',
        marginBottom: '12px',
        letterSpacing: '1px',
    },
    featureDescription: {
        fontSize: '18px',
        color: '#6B7280',
        lineHeight: '1.7',
    },
    scoring: {
        padding: '100px 0',
        background: '#FAF6EF', // Subtle beige section
    },
    scoringContainer: {
        maxWidth: '1500px',
        margin: '0 auto',
        padding: '0 24px',
    },
    scoringGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        marginTop: '48px',
    },
    scoringCard: {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    },
    scoringPoints: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2.5rem',
        color: '#E6CFA6',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    scoringLabel: {
        fontSize: '1.125rem',
        color: '#374151',
        fontWeight: '600',
        marginTop: '8px',
    },
    cta: {
        padding: '80px 0',
        background: 'linear-gradient(135deg, #3A4B41 0%, #2A3831 100%)',
        textAlign: 'center',
    },
    ctaContainer: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 24px',
    },
    ctaTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        color: '#E6CFA6',
        marginBottom: '16px',
        letterSpacing: '2px',
    },
    ctaSubtitle: {
        fontSize: '1.5rem',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '40px',
        maxWidth: '650px',
        margin: '0 auto 40px',
    },
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
}

const features = [
    {
        icon: <FileText size={28} />,
        title: 'Smart Resume Builder',
        description: 'Fill in your details step-by-step with an intuitive guided form. No design skills needed.',
    },
    {
        icon: <BarChart3 size={28} />,
        title: 'Score Analysis',
        description: 'Receive a detailed 0-100 score with actionable feedback to improve your resume.',
    },
    {
        icon: <Palette size={28} />,
        title: 'Premium Templates',
        description: 'Choose from multiple professional templates designed for various industries.',
    },
    {
        icon: <Zap size={28} />,
        title: 'Instant Generation',
        description: 'Generate polished, professional resumes in seconds with AI-powered formatting.',
    },
    {
        icon: <Download size={28} />,
        title: 'PDF Export',
        description: 'Download high-quality, print-ready PDFs that look great on any device.',
    },
    {
    icon: <UserPen size={28} />,
    title: 'AI Bio Generation',
    description: 'Automatically generate professional bios for job seekers, tailored to highlight skills, experience, and career goals for job applications.'
}

]

const scoringCriteria = [
    { points: 25, label: 'Keyword Matching' },
    { points: 20, label: 'Quantification' },
    { points: 15, label: 'Grammar & Spelling' },
    { points: 15, label: 'Section Completeness' },
    { points: 10, label: 'Action Verbs' },
    { points: 15, label: 'ATS Readability' },
]

function Landing() {
    return (
        <div style={styles.landing}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroBackground}>
                    <motion.div
                        style={styles.heroBlob1}
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 30, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        style={styles.heroBlob2}
                        animate={{
                            scale: [1, 1.1, 1],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        style={styles.heroBlob3}
                        animate={{
                            opacity: [0.4, 0.7, 0.4],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </div>

                <div style={styles.heroContainer} className="hero-container">
                    <motion.div
                        style={styles.heroContent}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div style={styles.badge} variants={itemVariants}>
                            <span style={styles.badgeDot} />
                            Built for Internships & Freshers
                        </motion.div>

                        <motion.h1 style={styles.heroTitle} variants={itemVariants}>
                            CREATE{' '}
                            <span style={styles.heroTitleAccent}>ATS-PERFECT</span>
                            <br />
                            RESUMES IN MINUTES
                        </motion.h1>

                        <motion.p style={styles.heroSubtitle} variants={itemVariants}>
                            Generate professional, hiring-manager-approved resumes that beat ATS systems.
                            Get scored, receive feedback, and land your dream job.
                        </motion.p>

                        <motion.div style={styles.heroCta} variants={itemVariants}>
                            <Link to="/builder">
                                <AnimatedButton variant="primary" size="large" icon={<ArrowRight size={20} />} iconPosition="right">
                                    Build My Resume
                                </AnimatedButton>
                            </Link>
                            <AnimatedButton variant="secondary" size="large">
                                See How It Works
                            </AnimatedButton>
                        </motion.div>

                        
                    </motion.div>

                    <motion.div
                        style={styles.heroVisual}
                        initial={{ opacity: 0, x: 50, rotateY: -10 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="hero-visual"
                    >
                        <div style={styles.resumeCard}>
                            <div style={styles.resumeHeader}>
                                <div style={styles.resumeName}>JOHN DOE</div>
                                <div style={styles.resumeTitle}>Software Developer | React Expert</div>
                            </div>
                            <div style={styles.resumeSection}>
                                <div style={styles.resumeSectionTitle}>Experience</div>
                                <div style={{ ...styles.resumeLine, width: '100%' }} />
                                <div style={{ ...styles.resumeLine, ...styles.resumeLineMedium }} />
                                <div style={{ ...styles.resumeLine, ...styles.resumeLineShort }} />
                            </div>
                            <div style={styles.resumeSection}>
                                <div style={styles.resumeSectionTitle}>Education</div>
                                <div style={{ ...styles.resumeLine, width: '90%' }} />
                                <div style={{ ...styles.resumeLine, ...styles.resumeLineShort }} />
                            </div>
                            <div style={styles.resumeSection}>
                                <div style={styles.resumeSectionTitle}>Skills</div>
                                <div style={{ ...styles.resumeLine, width: '85%' }} />
                            </div>
                        </div>
                        <motion.div
                            style={styles.scoreOverlay}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 1, type: 'spring' }}
                        >
                            <div style={styles.scoreNumber}>92</div>
                            <div style={styles.scoreLabel}>ATS Score</div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section style={styles.features}>
                <div style={styles.featuresContainer}>
                    <motion.div
                        style={styles.sectionHeader}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 style={styles.sectionTitle}>EVERYTHING YOU NEED FOR THE PERFECT RESUME</h2>
                        <p style={styles.sectionSubtitle}>
                            Our powerful tools help you create standout resumes that get you noticed by recruiters.
                        </p>
                    </motion.div>

                    <div style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                style={styles.featureCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{
                                    y: -8,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                    borderColor: '#E6CFA6',
                                }}
                            >
                                <div style={styles.featureIcon}>{feature.icon}</div>
                                <h3 style={styles.featureTitle}>{feature.title}</h3>
                                <p style={styles.featureDescription}>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scoring Section */}
            <section style={styles.scoring}>
                <div style={styles.scoringContainer}>
                    <motion.div
                        style={styles.sectionHeader}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 style={styles.sectionTitle}>HOW WE SCORE YOUR RESUME</h2>
                        <p style={styles.sectionSubtitle}>
                            Our comprehensive scoring system analyzes every aspect of your resume to ensure ATS compatibility.
                        </p>
                    </motion.div>

                    <div style={styles.scoringGrid}>
                        {scoringCriteria.map((item, index) => (
                            <motion.div
                                key={item.label}
                                style={styles.scoringCard}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div style={styles.scoringPoints}>{item.points}</div>
                                <div style={styles.scoringLabel}>{item.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={styles.cta}>
                <motion.div
                    style={styles.ctaContainer}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 style={styles.ctaTitle}>READY TO BUILD YOUR PERFECT RESUME?</h2>
                    <p style={styles.ctaSubtitle}>
                        Join thousands of job seekers who have landed their dream jobs with InternX resumes.
                    </p>
                    <Link to="/builder">
                        <AnimatedButton variant="beige" size="large" icon={<ArrowRight size={20} />} iconPosition="right">
                            Start Building Now
                        </AnimatedButton>
                    </Link>
                </motion.div>
            </section>

            <style>{`
        @media (max-width: 968px) {
          .hero-container {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-visual {
            display: none !important;
          }
        }
      `}</style>
        </div>
    )
}

export default Landing
