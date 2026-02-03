import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, ArrowUpCircle, Lightbulb, XCircle } from 'lucide-react'

const styles = {
    panel: {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    },
    title: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2rem',
        color: '#3A4B41',
        marginBottom: '20px',
        letterSpacing: '1.5px',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    item: {
        display: 'flex',
        gap: '14px',
        padding: '20px',
        borderRadius: '12px',
        fontSize: '18px',
        lineHeight: '1.6',
        alignItems: 'flex-start',
    },
    itemSuccess: {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#065F46',
    },
    itemWarning: {
        background: 'rgba(245, 158, 11, 0.1)',
        color: '#92400E',
    },
    itemImprove: {
        background: 'rgba(59, 130, 246, 0.1)',
        color: '#1E40AF',
    },
    itemTip: {
        background: 'rgba(139, 92, 246, 0.1)',
        color: '#5B21B6',
    },
    itemError: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#991B1B',
    },
    icon: {
        flexShrink: 0,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
    },
    iconSuccess: {
        background: '#10B981',
        color: 'white',
    },
    iconWarning: {
        background: '#F59E0B',
        color: 'white',
    },
    iconImprove: {
        background: '#3B82F6',
        color: 'white',
    },
    iconTip: {
        background: '#8B5CF6',
        color: 'white',
    },
    iconError: {
        background: '#EF4444',
        color: 'white',
    },
    emptyState: {
        textAlign: 'center',
        color: '#9CA3AF',
        padding: '24px',
        fontSize: '13px',
    },
}

const typeConfig = {
    success: {
        itemStyle: styles.itemSuccess,
        iconStyle: styles.iconSuccess,
        icon: <CheckCircle2 size={14} />,
    },
    warning: {
        itemStyle: styles.itemWarning,
        iconStyle: styles.iconWarning,
        icon: <AlertTriangle size={14} />,
    },
    improve: {
        itemStyle: styles.itemImprove,
        iconStyle: styles.iconImprove,
        icon: <ArrowUpCircle size={14} />,
    },
    tip: {
        itemStyle: styles.itemTip,
        iconStyle: styles.iconTip,
        icon: <Lightbulb size={14} />,
    },
    error: {
        itemStyle: styles.itemError,
        iconStyle: styles.iconError,
        icon: <XCircle size={14} />,
    },
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 },
    },
}

function FeedbackPanel({ feedback }) {
    if (!feedback || feedback.length === 0) {
        return (
            <div style={styles.panel}>
                <h3 style={styles.title}>FEEDBACK</h3>
                <div style={styles.emptyState}>
                    <p>Analyze your resume to get improvement suggestions</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.panel}>
            <h3 style={styles.title}>FEEDBACK</h3>
            <motion.div
                style={styles.list}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {feedback.map((item, index) => {
                    const config = typeConfig[item.type] || typeConfig.tip
                    return (
                        <motion.div
                            key={index}
                            style={{ ...styles.item, ...config.itemStyle }}
                            variants={itemVariants}
                        >
                            <span style={{ ...styles.icon, ...config.iconStyle }}>
                                {config.icon}
                            </span>
                            <span>{item.message}</span>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    )
}

export default FeedbackPanel
