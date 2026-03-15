import { styles } from './FormStyles'
import TagInput from './TagInput'

export default function AchievementSection({ data, onAddTag, onRemoveTag }) {
    return (
        <div>
            <h3 style={styles.sectionTitle}>ACHIEVEMENTS & CERTIFICATIONS</h3>
            <p style={styles.sectionSubtitle}>Add your notable honors, awards, and industry certifications</p>

            <div style={styles.formGroup}>
                <label style={styles.label}>Achievements (press Enter to add)</label>
                <TagInput
                    tags={data || []}
                    onAdd={(value) => onAddTag('achievements', value)}
                    onRemove={(index) => onRemoveTag('achievements', index)}
                    placeholder="e.g., Won Regional Hackathon 2023, AWS Cloud Practitioner..."
                />
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Pro Tip for ATS:</h4>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                    Include certifications that match the keywords in the job description. Achievements that quantify your impact (e.g., "Increased sales by 20%") are highly valued by recruiters.
                </p>
            </div>
        </div>
    )
}
