import { Plus, Trash2, X } from 'lucide-react'
import { styles } from './FormStyles'

export default function ExperienceSection({
    data,
    onAdd,
    onRemove,
    onUpdate,
    onAddBullet,
    onUpdateBullet,
    onRemoveBullet
}) {
    return (
        <div>
            <h3 style={styles.sectionTitle}>EXPERIENCE</h3>
            <p style={styles.sectionSubtitle}>Add your work experience (most recent first)</p>

            {(data || []).map((exp, index) => (
                <div key={index} style={styles.arrayItem}>
                    <div style={styles.arrayItemHeader}>
                        <span style={styles.arrayItemTitle}>Experience {index + 1}</span>
                        {index > 0 && (
                            <button
                                type="button"
                                style={styles.removeButton}
                                onClick={() => onRemove('experience', index)}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Company Name</label>
                            <input
                                style={styles.input}
                                placeholder="Google"
                                value={exp.company || ''}
                                onChange={(e) => onUpdate('experience', index, 'company', e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Role/Position</label>
                            <input
                                style={styles.input}
                                placeholder="Software Engineer Intern"
                                value={exp.role || ''}
                                onChange={(e) => onUpdate('experience', index, 'role', e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Start Date</label>
                            <input
                                style={styles.input}
                                placeholder="Jan 2023"
                                value={exp.startDate || ''}
                                onChange={(e) => onUpdate('experience', index, 'startDate', e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>End Date</label>
                            <input
                                style={styles.input}
                                placeholder="Present"
                                value={exp.endDate || ''}
                                onChange={(e) => onUpdate('experience', index, 'endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Responsibilities (use action verbs & add metrics)</label>
                        <div style={styles.bulletList}>
                            {(exp.responsibilities || ['']).map((resp, bIndex) => (
                                <div key={bIndex} style={styles.bulletItem}>
                                    <span style={{ color: '#6B7280', marginTop: '10px' }}>•</span>
                                    <input
                                        style={{ ...styles.input, ...styles.bulletInput }}
                                        placeholder="Led development of..."
                                        value={resp}
                                        onChange={(e) => onUpdateBullet(index, bIndex, e.target.value)}
                                    />
                                    {bIndex > 0 && (
                                        <button
                                            type="button"
                                            style={styles.bulletRemove}
                                            onClick={() => onRemoveBullet(index, bIndex)}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                style={{ ...styles.addButton, marginTop: '8px' }}
                                onClick={() => onAddBullet(index)}
                            >
                                <Plus size={16} /> Add Bullet Point
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                style={styles.addButton}
                onClick={() => onAdd('experience', { company: '', role: '', startDate: '', endDate: '', responsibilities: [''] })}
            >
                <Plus size={18} /> Add Another Experience
            </button>
        </div>
    )
}
