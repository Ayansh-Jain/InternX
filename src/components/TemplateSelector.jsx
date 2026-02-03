import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const styles = {
    selector: {
        display: 'flex',
        gap: '12px',
    },
    templateCard: {
        flex: '1',
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: 'white',
        textAlign: 'center',
    },
    templateCardInactive: {
        borderColor: '#E5E7EB',
    },
    templateCardActive: {
        borderColor: '#3A4B41',
        boxShadow: '0 4px 12px rgba(58, 75, 65, 0.15)',
    },
    templatePreview: {
        width: '100%',
        height: '80px',
        background: '#F9FAFB',
        borderRadius: '6px',
        marginBottom: '8px',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
        gap: '4px',
    },
    previewLine: {
        height: '6px',
        background: '#E5E7EB',
        borderRadius: '3px',
    },
    previewLineHeader: {
        width: '60%',
        margin: '0 auto',
        marginBottom: '4px',
    },
    previewLineShort: {
        width: '40%',
    },
    previewLineMedium: {
        width: '70%',
    },
    templateName: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#374151',
    },
    checkmark: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#3A4B41',
        color: '#E6CFA6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
    },
}

const templateConfig = [
    {
        id: 'classic',
        name: 'Classic',
        preview: {
            headerAlign: 'center',
            border: '2px solid #1F2937',
        },
    },
    {
        id: 'modern',
        name: 'Modern',
        preview: {
            headerAlign: 'left',
            border: 'none',
            leftBorder: '4px solid #3A4B41',
        },
    },
    {
        id: 'minimal',
        name: 'Minimal',
        preview: {
            headerAlign: 'left',
            border: '1px solid #E5E7EB',
        },
    },
]

function TemplateSelector({ selected, onSelect }) {
    return (
        <div style={styles.selector}>
            {templateConfig.map((template) => (
                <motion.div
                    key={template.id}
                    style={{
                        ...styles.templateCard,
                        ...(selected === template.id
                            ? styles.templateCardActive
                            : styles.templateCardInactive),
                        position: 'relative',
                    }}
                    onClick={() => onSelect(template.id)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {selected === template.id && (
                        <motion.div
                            style={styles.checkmark}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            <Check size={14} />
                        </motion.div>
                    )}

                    <div
                        style={{
                            ...styles.templatePreview,
                            borderLeft: template.preview.leftBorder || 'none',
                        }}
                    >
                        <div
                            style={{
                                ...styles.previewLine,
                                ...styles.previewLineHeader,
                                marginLeft: template.preview.headerAlign === 'left' ? 0 : 'auto',
                                marginRight: template.preview.headerAlign === 'left' ? 'auto' : 'auto',
                                background: '#9CA3AF',
                            }}
                        />
                        <div style={{ ...styles.previewLine, width: '100%' }} />
                        <div style={{ ...styles.previewLine, ...styles.previewLineMedium }} />
                        <div style={{ ...styles.previewLine, ...styles.previewLineShort }} />
                    </div>

                    <span style={styles.templateName}>{template.name}</span>
                </motion.div>
            ))}
        </div>
    )
}

export default TemplateSelector
