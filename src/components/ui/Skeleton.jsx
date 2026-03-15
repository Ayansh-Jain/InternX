/**
 * Skeleton loading UI components for InternX.
 * Replaces spinners with content-shaped placeholder animations.
 *
 * Usage:
 *   <Skeleton width="100%" height={24} />
 *   <SkeletonCard />
 *   <SkeletonJobCard />
 */
import { keyframes } from '@emotion/react'

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'internx-shimmer 1.5s infinite linear',
  borderRadius: '6px',
}

// Inject keyframe once
if (typeof document !== 'undefined' && !document.getElementById('internx-skeleton-styles')) {
  const style = document.createElement('style')
  style.id = 'internx-skeleton-styles'
  style.textContent = `
    @keyframes internx-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `
  document.head.appendChild(style)
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style = {} }) {
  return (
    <div
      style={{
        ...shimmerStyle,
        width,
        height,
        borderRadius,
        flexShrink: 0,
        ...style,
      }}
      role="presentation"
      aria-hidden="true"
    />
  )
}

/** A skeleton that mimics a job card */
export function SkeletonJobCard() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Skeleton width={44} height={44} borderRadius={8} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="70%" height={16} />
          <Skeleton width="45%" height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={12} />
      <Skeleton width="85%" height={12} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Skeleton width={70} height={24} borderRadius={20} />
        <Skeleton width={80} height={24} borderRadius={20} />
        <Skeleton width={60} height={24} borderRadius={20} />
      </div>
    </div>
  )
}

/** A skeleton that mimics a stats/score card */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <Skeleton width="50%" height={20} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={`${90 - i * 10}%`} height={14} />
      ))}
    </div>
  )
}

/** A full-page skeleton loader for dashboards */
export function SkeletonDashboard() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Skeleton width={240} height={32} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonJobCard key={i} />
        ))}
      </div>
    </div>
  )
}
