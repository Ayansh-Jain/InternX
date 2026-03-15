/**
 * Enhanced ScoreCard with:
 * - Total score SVG ring (animated)
 * - Per-category mini progress bars with tooltips
 * - Score history mini-chart (if available)
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORY_META = {
  completeness:    { label: 'Completeness',    max: 15, color: '#6366F1', tip: 'Checks if all sections (contact, skills, experience, education) are present.' },
  keywords:        { label: 'Keywords',         max: 25, color: '#0EA5E9', tip: 'How well your resume matches keywords for your target role.' },
  quantification:  { label: 'Quantification',   max: 20, color: '#10B981', tip: 'How many numbers and metrics appear (e.g. "reduced latency by 40%").' },
  action_verbs:    { label: 'Action Verbs',     max: 10, color: '#F59E0B', tip: 'Usage of strong action verbs like "Led", "Developed", "Achieved".' },
  grammar:         { label: 'Grammar & Format', max: 15, color: '#EF4444', tip: 'Basic grammar, valid email format, proper capitalization.' },
  ats_readability: { label: 'ATS Readability',  max: 15, color: '#8B5CF6', tip: 'Whether the resume structure is easy for ATS parsers to process.' },
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
  if (score >= 30) return 'Needs work. Follow the suggestions below.'
  return 'Keep adding content to improve your score.'
}

/** Mini progress bar for a single category */
function CategoryBar({ category, value, tooltipVisible, onHover, onLeave }) {
  const meta = CATEGORY_META[category] || { label: category, max: 25, color: '#6B7280', tip: '' }
  const pct = Math.min(100, (value / meta.max) * 100)

  return (
    <div style={{ marginBottom: '10px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span
          style={{ fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'help' }}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        >
          {meta.label}
          <span style={{ marginLeft: '4px', opacity: 0.5, fontSize: '11px' }}>ⓘ</span>
        </span>
        <span style={{ fontSize: '12px', color: '#6B7280' }}>{value}/{meta.max}</span>
      </div>

      {/* Progress track */}
      <div style={{ background: '#F3F4F6', borderRadius: '999px', height: '7px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          style={{ height: '100%', background: meta.color, borderRadius: '999px' }}
        />
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltipVisible && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              background: '#1F2937',
              color: 'white',
              fontSize: '11px',
              padding: '6px 10px',
              borderRadius: '6px',
              maxWidth: '220px',
              lineHeight: 1.4,
              zIndex: 10,
              marginBottom: '6px',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {meta.tip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScoreCard({ score, breakdown = null }) {
  const colors = getScoreColor(score || 0)
  const r = 72
  const circumference = 2 * Math.PI * r
  const [tooltip, setTooltip] = useState(null)

  if (score === null || score === undefined) {
    return (
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <div style={{ width: 160, height: 160, borderRadius: '50%', background: '#F3F4F6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '64px', color: '#9CA3AF', lineHeight: 1 }}>--</span>
        </div>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#3A4B41', marginBottom: '10px', letterSpacing: '1.5px' }}>ATS SCORE</h3>
        <p style={{ color: '#6B7280', fontSize: '15px' }}>Click "Analyze Score" to evaluate your resume</p>
      </div>
    )
  }

  return (
    <motion.div
      style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Big score ring */}
      <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 20px' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 160, height: 160, transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
          <motion.circle
            cx="80" cy="80" r={r} fill="none"
            stroke={colors.stroke} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - ((score / 100) * circumference) }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: colors.bg }}>
          <motion.span
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '62px', lineHeight: 1, color: colors.text }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          >
            {score}
          </motion.span>
          <span style={{ fontSize: '18px', fontWeight: 600, opacity: 0.75, color: colors.text }}>/100</span>
        </div>
      </div>

      {/* Title + message */}
      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: '#3A4B41', marginBottom: '6px', letterSpacing: '1.5px', textAlign: 'center' }}>ATS SCORE</h3>
      <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.5, textAlign: 'center', marginBottom: breakdown ? '20px' : '0' }}>
        {getScoreMessage(score)}
      </p>

      {/* Per-category breakdown bars */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div style={{ marginTop: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9CA3AF', marginBottom: '12px' }}>
            Category Breakdown
          </p>
          {Object.entries(breakdown).map(([key, val]) => (
            <CategoryBar
              key={key}
              category={key}
              value={val}
              tooltipVisible={tooltip === key}
              onHover={() => setTooltip(key)}
              onLeave={() => setTooltip(null)}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ScoreCard
