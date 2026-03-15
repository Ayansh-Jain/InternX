import { Plus, Trash2 } from 'lucide-react'
import { styles } from './FormStyles'

export default function EducationSection({ data, onAdd, onRemove, onUpdate }) {
    return (
        <div>
            <h3 style={styles.sectionTitle}>EDUCATION</h3>
            <p style={styles.sectionSubtitle}>Add your educational background</p>

            {(data || []).map((edu, index) => (
                <div key={index} style={styles.arrayItem}>
                    <div style={styles.arrayItemHeader}>
                        <span style={styles.arrayItemTitle}>Education {index + 1}</span>
                        {index > 0 && (
                            <button
                                type="button"
                                style={styles.removeButton}
                                onClick={() => onRemove('education', index)}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Degree *</label>
                            <input
                                style={styles.input}
                                placeholder="B.Tech Computer Science"
                                value={edu.degree || ''}
                                onChange={(e) => onUpdate('education', index, 'degree', e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>College/University *</label>
                            <input
                                style={styles.input}
                                placeholder="MIT"
                                value={edu.college || ''}
                                onChange={(e) => onUpdate('education', index, 'college', e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Start Year</label>
                            <input
                                type="number"
                                style={styles.input}
                                placeholder="2020"
                                value={edu.startYear || ''}
                                onChange={(e) => onUpdate('education', index, 'startYear', e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>End Year</label>
                            <input
                                type="number"
                                style={styles.input}
                                placeholder="2024"
                                value={edu.endYear || ''}
                                onChange={(e) => onUpdate('education', index, 'endYear', e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>CGPA / Percentage</label>
                            <input
                                style={styles.input}
                                placeholder="3.8 / 4.0 or 85%"
                                value={edu.cgpa || ''}
                                onChange={(e) => onUpdate('education', index, 'cgpa', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                style={styles.addButton}
                onClick={() => onAdd('education', { degree: '', college: '', startYear: '', endYear: '', cgpa: '' })}
            >
                <Plus size={18} /> Add Another Education
            </button>
        </div>
    )
}
