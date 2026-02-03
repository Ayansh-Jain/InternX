import { motion } from 'framer-motion'

const styles = {
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        textAlign: 'center',
    },
    scoreContainer: {
        position: 'relative',
        width: '160px',
        height: '160px',
        margin: '0 auto 24px',
    },
    scoreCircle: {
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)',
    },
    scoreNumber: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '64px',
        lineHeight: '1',
        marginBottom: '-5px',
    },
    scoreLabel: {
        fontSize: '20px',
        fontWeight: '600',
        opacity: 0.8,
    },
    title: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2rem',
        color: '#3A4B41',
        marginBottom: '10px',
        letterSpacing: '1.5px',
    },
    message: {
        fontSize: '16px',
        color: '#6B7280',
        lineHeight: '1.6',
    },
    svgCircle: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '160px',
        height: '160px',
        transform: 'rotate(-90deg)',
    },
}

const getScoreColor = (score) => {
    if (score >= 70) return { bg: '#D1FAE5', text: '#059669', stroke: '#10B981' }
    if (score >= 40) return { bg: '#FEF3C7', text: '#D97706', stroke: '#F59E0B' }
    return { bg: '#FEE2E2', text: '#DC2626', stroke: '#EF4444' }
}

const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent! Your resume is highly ATS-optimized.'
    if (score >= 70) return 'Great job! Your resume is well-structured.'
    if (score >= 50) return 'Good start! Some improvements recommended.'
    if (score >= 30) return 'Needs work. Follow our suggestions.'
    return 'Keep adding content to improve your score.'
}

function ScoreCard({ score }) {
    const colors = getScoreColor(score || 0)
    const circumference = 2 * Math.PI * 52
    const strokeDashoffset = circumference - (((score || 0) / 100) * circumference)

    if (score === null || score === undefined) {
        return (
            <div style={styles.card}>
                <div style={{ ...styles.scoreCircle, background: '#F3F4F6' }}>
                    <span style={{ ...styles.scoreNumber, color: '#9CA3AF' }}>--</span>
                </div>
                <h3 style={styles.title}>ATS SCORE</h3>
                <p style={styles.message}>Click "Analyze Score" to evaluate your resume</p>
            </div>
        )
    }

    return (
        <motion.div
            style={styles.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div style={styles.scoreContainer}>
                <svg style={styles.svgCircle}>
                    {/* Background circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r="72"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="10"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="80"
                        cy="80"
                        r="72"
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 72}
                        initial={{ strokeDashoffset: 2 * Math.PI * 72 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 72 - (((score || 0) / 100) * (2 * Math.PI * 72)) }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>
                <div style={{ ...styles.scoreCircle, background: colors.bg }}>
                    <motion.span
                        style={{ ...styles.scoreNumber, color: colors.text }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {score}
                    </motion.span>
                    <span style={{ ...styles.scoreLabel, color: colors.text }}>/100</span>
                </div>
            </div>
            <h3 style={styles.title}>ATS SCORE</h3>
            <p style={styles.message}>{getScoreMessage(score)}</p>
        </motion.div>
    )
}

export default ScoreCard
