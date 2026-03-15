import { Upload, Loader2 } from 'lucide-react'
import { styles } from './FormStyles'

export default function PersonalSection({ data, onInputChange, onImport, isParsing }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={styles.sectionTitle}>PERSONAL INFORMATION</h3>
                    <p style={styles.sectionSubtitle}>Let&apos;s start with your basic contact information</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'rgba(230,207,166,0.15)',
                        border: '1px dashed #E6CFA6',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: '#3A4B41',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                    }}>
                        {isParsing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {isParsing ? 'Importing...' : 'Import Resume (PDF)'}
                        <input
                            type="file"
                            accept=".pdf"
                            hidden
                            onChange={onImport}
                            disabled={isParsing}
                        />
                    </label>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Fastest way to fill the form!</span>
                </div>
            </div>

            <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input
                        style={styles.input}
                        placeholder="John Doe"
                        value={data?.fullName || ''}
                        onChange={(e) => onInputChange('personal.fullName', e.target.value)}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Email *</label>
                    <input
                        type="email"
                        style={styles.input}
                        placeholder="john@email.com"
                        value={data?.email || ''}
                        onChange={(e) => onInputChange('personal.email', e.target.value)}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Phone *</label>
                    <input
                        type="tel"
                        style={styles.input}
                        placeholder="+1 234 567 8900"
                        value={data?.phone || ''}
                        onChange={(e) => onInputChange('personal.phone', e.target.value)}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Location</label>
                    <input
                        style={styles.input}
                        placeholder="New York, NY"
                        value={data?.location || ''}
                        onChange={(e) => onInputChange('personal.location', e.target.value)}
                    />
                </div>
            </div>

            <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>LinkedIn URL</label>
                    <input
                        style={styles.input}
                        placeholder="linkedin.com/in/johndoe"
                        value={data?.linkedIn || ''}
                        onChange={(e) => onInputChange('personal.linkedIn', e.target.value)}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>GitHub URL</label>
                    <input
                        style={styles.input}
                        placeholder="github.com/johndoe"
                        value={data?.github || ''}
                        onChange={(e) => onInputChange('personal.github', e.target.value)}
                    />
                </div>

                <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Portfolio URL</label>
                    <input
                        style={styles.input}
                        placeholder="johndoe.com"
                        value={data?.portfolio || ''}
                        onChange={(e) => onInputChange('personal.portfolio', e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}
