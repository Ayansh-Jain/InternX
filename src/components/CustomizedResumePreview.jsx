import React from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

const baseStyles = {
    preview: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        lineHeight: '1.5',
        color: '#1F2937',
        padding: '40px',
        background: 'white',
    },
    header: {
        textAlign: 'center',
        paddingBottom: '16px',
        marginBottom: '20px',
    },
    name: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: '4px',
        letterSpacing: '1px',
    },
    title: {
        fontSize: '12px',
        color: '#6B7280',
        marginBottom: '8px',
    },
    contact: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '10px',
        color: '#4B5563',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    section: {
        marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#1F2937',
        paddingBottom: '4px',
        marginBottom: '8px',
        borderBottom: '1.5px solid #1F2937',
    },
    itemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '4px',
    },
    itemTitle: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#1F2937',
    },
    itemSubtitle: {
        fontSize: '10px',
        color: '#6B7280',
    },
    itemDate: {
        fontSize: '10px',
        color: '#6B7280',
        whiteSpace: 'nowrap',
    },
    bulletList: {
        paddingLeft: '16px',
        margin: '4px 0',
    },
    bullet: {
        fontSize: '10px',
        color: '#374151',
        marginBottom: '2px',
        lineHeight: '1.4',
    },
    skillsGroup: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '8px',
    },
    skillLabel: {
        fontWeight: '600',
        fontSize: '10px',
        color: '#374151',
        marginRight: '4px',
    },
    skillValue: {
        fontSize: '10px',
        color: '#4B5563',
    },
    tag: {
        padding: '2px 8px',
        background: '#F3F4F6',
        borderRadius: '4px',
        fontSize: '9px',
        color: '#374151',
    },
}

// Template variations
const templates = {
    classic: {
        ...baseStyles,
        header: {
            ...baseStyles.header,
            borderBottom: '2px solid #1F2937',
        },
    },
    modern: {
        ...baseStyles,
        preview: {
            ...baseStyles.preview,
            paddingLeft: '48px',
            borderLeft: '4px solid #3A4B41',
        },
        header: {
            ...baseStyles.header,
            textAlign: 'left',
            borderBottom: 'none',
        },
        name: {
            ...baseStyles.name,
            color: '#3A4B41',
        },
        sectionTitle: {
            ...baseStyles.sectionTitle,
            color: '#3A4B41',
            borderBottomColor: '#3A4B41',
        },
    },
    minimal: {
        ...baseStyles,
        preview: {
            ...baseStyles.preview,
            padding: '32px',
        },
        header: {
            ...baseStyles.header,
            textAlign: 'left',
            borderBottom: '1px solid #E5E7EB',
        },
        sectionTitle: {
            ...baseStyles.sectionTitle,
            fontSize: '11px',
            fontWeight: '600',
            borderBottom: '1px solid #E5E7EB',
        },
    },
}

const renderFormattedText = (bulletArray) => {
    if (!bulletArray || !Array.isArray(bulletArray)) return null;
    return bulletArray.map((item, idx) => {
        let style = {};
        if (item.bold) style.fontWeight = 'bold';
        if (item.italic) style.fontStyle = 'italic';
        
        if (item.type === 'link' || item.link) {
            return <a key={idx} href={item.link || '#'} style={{...style, color: '#2563EB', textDecoration: 'underline'}}>{item.text}</a>
        }
        return <span key={idx} style={style}>{item.text}</span>
    });
}

function CustomizedResumePreview({ data, rawData, template = 'classic' }) {
    const styles = templates[template] || templates.classic

    // data contains the customized structured JSON from the LLM
    // rawData contains the user's original un-customized resume for fields like personal info that LLM might not return

    const personal = rawData?.personal || {};
    const target = rawData?.target || {};

    const hasExperience = data?.experience?.length > 0;
    const hasProjects = data?.projects?.length > 0;
    
    if (!data) {
        return (
            <div id="resume-preview" style={{ ...styles.preview, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '16px', opacity: 0.5, display: 'flex', justifyContent: 'center' }}>
                        <FileText size={48} />
                    </div>
                    <p>Tailoring resume to job description...</p>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            id="resume-preview"
            style={styles.preview}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.name}>
                    {personal?.fullName?.toUpperCase() || 'YOUR NAME'}
                </h1>
                {target?.jobRole && (
                    <p style={styles.title}>{target.jobRole}</p>
                )}
                <div style={styles.contact}>
                    {personal?.email && (
                        <span style={styles.contactItem}>{personal.email}</span>
                    )}
                    {personal?.phone && (
                        <span style={styles.contactItem}>| {personal.phone}</span>
                    )}
                    {personal?.location && (
                        <span style={styles.contactItem}>| {personal.location}</span>
                    )}
                    {personal?.linkedIn && (
                        <span style={styles.contactItem}>| {personal.linkedIn}</span>
                    )}
                    {personal?.github && (
                        <span style={styles.contactItem}>| {personal.github}</span>
                    )}
                    {personal?.portfolio && (
                        <span style={styles.contactItem}>| {personal.portfolio}</span>
                    )}
                </div>
            </div>

            {/* Education */}
            {(rawData?.education?.filter(edu => edu.degree || edu.college)?.length || 0) > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Education</h2>
                    {rawData.education.filter(edu => edu.degree || edu.college).map((edu, index) => (
                        <div key={index} style={{ marginBottom: '8px' }}>
                            <div style={styles.itemHeader}>
                                <div>
                                    <div style={styles.itemTitle}>{edu.degree}</div>
                                    <div style={styles.itemSubtitle}>{edu.college}</div>
                                </div>
                                <div style={styles.itemDate}>
                                    {edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : edu.endYear}
                                    {edu.cgpa && ` | ${edu.cgpa}`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {(rawData?.skills?.technical?.length > 0 || rawData?.skills?.tools?.length > 0 || rawData?.skills?.soft?.length > 0) && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Skills</h2>
                    <div>
                        {rawData.skills?.technical?.length > 0 && (
                            <div style={{ marginBottom: '4px' }}>
                                <span style={styles.skillLabel}>Technical:</span>
                                <span style={styles.skillValue}>{rawData.skills.technical.join(', ')}</span>
                            </div>
                        )}
                        {rawData.skills?.tools?.length > 0 && (
                            <div style={{ marginBottom: '4px' }}>
                                <span style={styles.skillLabel}>Tools:</span>
                                <span style={styles.skillValue}>{rawData.skills.tools.join(', ')}</span>
                            </div>
                        )}
                        {rawData.skills?.soft?.length > 0 && (
                            <div style={{ marginBottom: '4px' }}>
                                <span style={styles.skillLabel}>Soft Skills:</span>
                                <span style={styles.skillValue}>{rawData.skills.soft.join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Experience */}
            {hasExperience && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Experience</h2>
                    {data.experience.map((exp, index) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                            <div style={styles.itemHeader}>
                                <div>
                                    <div style={styles.itemTitle}>{exp.role}</div>
                                    <div style={styles.itemSubtitle}>{exp.company}</div>
                                </div>
                                <div style={styles.itemDate}>
                                    {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}
                                </div>
                            </div>
                            {exp.bullets?.length > 0 && (
                                <ul style={styles.bulletList}>
                                    {exp.bullets.map((bullet, rIndex) => (
                                        <li key={rIndex} style={styles.bullet}>
                                            {bullet.formatting ? 
                                                renderFormattedText(bullet.formatting) : 
                                                (bullet.text || bullet.tailored_text || bullet.original_text)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {hasProjects && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Projects</h2>
                    {data.projects.map((proj, index) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                            <div style={styles.itemHeader}>
                                <div style={styles.itemTitle}>{proj.title}</div>
                            </div>
                            {proj.bullets?.length > 0 && (
                                <ul style={styles.bulletList}>
                                    {proj.bullets.map((bullet, rIndex) => (
                                        <li key={rIndex} style={styles.bullet}>
                                            {bullet.formatting ? 
                                                renderFormattedText(bullet.formatting) : 
                                                (bullet.text || bullet.tailored_text || bullet.original_text)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Achievements */}
            {rawData?.achievements?.length > 0 && (
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Achievements & Certifications</h2>
                    <ul style={styles.bulletList}>
                        {rawData.achievements.map((achievement, index) => (
                            <li key={index} style={styles.bullet}>{achievement}</li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    )
}

export default CustomizedResumePreview
