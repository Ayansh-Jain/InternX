import { styles } from './FormStyles'
import TagInput from './TagInput'

export default function SkillsSection({ data, onAddTag, onRemoveTag }) {
    return (
        <div>
            <h3 style={styles.sectionTitle}>SKILLS</h3>
            <p style={styles.sectionSubtitle}>Add your technical and soft skills (press Enter to add)</p>

            <div style={styles.formGroup}>
                <label style={styles.label}>Technical Skills *</label>
                <TagInput
                    tags={data?.technical || []}
                    onAdd={(value) => onAddTag('skills.technical', value)}
                    onRemove={(index) => onRemoveTag('skills.technical', index)}
                    placeholder="e.g., JavaScript, React, Python..."
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Tools & Technologies</label>
                <TagInput
                    tags={data?.tools || []}
                    onAdd={(value) => onAddTag('skills.tools', value)}
                    onRemove={(index) => onRemoveTag('skills.tools', index)}
                    placeholder="e.g., Git, Docker, AWS..."
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Soft Skills</label>
                <TagInput
                    tags={data?.soft || []}
                    onAdd={(value) => onAddTag('skills.soft', value)}
                    onRemove={(index) => onRemoveTag('skills.soft', index)}
                    placeholder="e.g., Leadership, Communication..."
                />
            </div>
        </div>
    )
}
