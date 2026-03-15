import { Sparkles } from 'lucide-react'
import { styles } from './FormStyles'

export default function TargetRoleSection({ data, onInputChange }) {
    return (
        <div>
            <h3 style={styles.sectionTitle}>TARGET JOB ROLE</h3>
            <p style={styles.sectionSubtitle}>Tell us what position you&apos;re applying for</p>

            <div style={styles.formGrid}>
                <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Desired Job Role *</label>
                    <input
                        style={styles.input}
                        placeholder="Frontend Developer"
                        value={data?.jobRole || ''}
                        onChange={(e) => onInputChange('target.jobRole', e.target.value)}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Experience Level</label>
                    <select
                        style={styles.select}
                        value={data?.experienceLevel || 'fresher'}
                        onChange={(e) => onInputChange('target.experienceLevel', e.target.value)}
                    >
                        <option value="fresher">Fresher / Entry Level</option>
                        <option value="junior">Junior (1-2 years)</option>
                        <option value="mid">Mid-Level (3-5 years)</option>
                        <option value="senior">Senior (5+ years)</option>
                    </select>
                </div>
            </div>

            <div style={{ marginTop: '32px', padding: '24px', background: 'linear-gradient(135deg, rgba(230,207,166,0.1), rgba(58,75,65,0.05))', borderRadius: '12px' }}>
                <h4 style={{ ...styles.sectionTitle, fontSize: '1.75rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={24} color="#E6CFA6" /> YOU'RE ALL SET!
                </h4>
                <p style={{ ...styles.sectionSubtitle, fontSize: '16px', marginBottom: '0' }}>
                    Review your resume preview on the right, then click "Analyze Score" to see how ATS-friendly your resume is, 
                    or "Download PDF" to export it.
                </p>
            </div>
        </div>
    )
}
