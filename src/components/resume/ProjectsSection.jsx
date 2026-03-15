import { Plus, Trash2 } from 'lucide-react'
import { styles } from './FormStyles'
import TagInput from './TagInput'

export default function ProjectsSection({ data, onAdd, onRemove, onUpdate }) {
    return (
        <div>
            <h3 style={styles.sectionTitle}>PROJECTS</h3>
            <p style={styles.sectionSubtitle}>Showcase your notable work and projects</p>

            {(data || []).map((proj, index) => (
                <div key={index} style={styles.arrayItem}>
                    <div style={styles.arrayItemHeader}>
                        <span style={styles.arrayItemTitle}>Project {index + 1}</span>
                        {index > 0 && (
                            <button
                                type="button"
                                style={styles.removeButton}
                                onClick={() => onRemove('projects', index)}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Project Title</label>
                            <input
                                style={styles.input}
                                placeholder="E-commerce Platform"
                                value={proj.title || ''}
                                onChange={(e) => onUpdate('projects', index, 'title', e.target.value)}
                            />
                        </div>

                        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                style={styles.textarea}
                                placeholder="Built a full-stack e-commerce platform with..."
                                value={proj.description || ''}
                                onChange={(e) => onUpdate('projects', index, 'description', e.target.value)}
                            />
                        </div>

                        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Tech Stack (press Enter to add)</label>
                            <TagInput
                                tags={proj.techStack || []}
                                onAdd={(value) => {
                                    const newTechStack = [...(proj.techStack || []), value]
                                    onUpdate('projects', index, 'techStack', newTechStack)
                                }}
                                onRemove={(tagIndex) => {
                                    const newTechStack = (proj.techStack || []).filter((_, i) => i !== tagIndex)
                                    onUpdate('projects', index, 'techStack', newTechStack)
                                }}
                                placeholder="React, Node.js, MongoDB..."
                            />
                        </div>

                    </div>
                </div>
            ))}

            <button
                type="button"
                style={styles.addButton}
                onClick={() => onAdd('projects', { title: '', description: '', techStack: [] })}
            >
                <Plus size={18} /> Add Another Project
            </button>
        </div>
    )
}
