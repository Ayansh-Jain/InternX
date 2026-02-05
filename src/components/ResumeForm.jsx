import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    GraduationCap,
    Lightbulb,
    Briefcase,
    Rocket,
    Target,
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    Sparkles,
    CheckCircle2,
    Trophy
} from 'lucide-react'
import AnimatedButton from './AnimatedButton.jsx'

const styles = {
    form: {
        width: '100%',
    },
    progressBar: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '32px',
        position: 'relative',
    },
    progressLine: {
        position: 'absolute',
        top: '16px',
        left: '10%',
        right: '10%',
        height: '2px',
        background: '#E5E7EB',
        zIndex: 0,
    },
    progressLineFill: {
        position: 'absolute',
        top: '16px',
        left: '10%',
        height: '2px',
        background: 'linear-gradient(90deg, #3A4B41, #E6CFA6)',
        zIndex: 1,
        transition: 'width 0.3s ease',
    },
    step: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 2,
        cursor: 'pointer',
    },
    stepCircle: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    },
    stepCircleInactive: {
        background: '#F3F4F6',
        color: '#9CA3AF',
        border: '2px solid #E5E7EB',
    },
    stepCircleActive: {
        background: 'linear-gradient(135deg, #3A4B41, #4A5D52)',
        color: '#E6CFA6',
        border: '2px solid #3A4B41',
        boxShadow: '0 4px 12px rgba(58, 75, 65, 0.3)',
    },
    stepCircleCompleted: {
        background: '#E6CFA6',
        color: '#3A4B41',
        border: '2px solid #E6CFA6',
    },
    stepLabel: {
        fontSize: '14px',
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: '100px',
        marginTop: '4px',
    },
    stepLabelActive: {
        color: '#3A4B41',
        fontWeight: '500',
    },
    stepContent: {
        minHeight: '400px',
    },
    sectionTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2rem',
        color: '#3A4B41',
        marginBottom: '12px',
        letterSpacing: '1px',
    },
    sectionSubtitle: {
        fontSize: '16px',
        color: '#6B7280',
        marginBottom: '32px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
    },
    formGroup: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '10px',
    },
    input: {
        width: '100%',
        padding: '16px 20px',
        fontSize: '18px',
        border: '2px solid #E5E7EB',
        borderRadius: '14px',
        background: '#FAFAFA',
        transition: 'all 0.2s ease',
        outline: 'none',
    },
    inputFocus: {
        borderColor: '#E6CFA6',
        background: 'white',
        boxShadow: '0 0 0 3px rgba(230, 207, 166, 0.2)',
    },
    textarea: {
        width: '100%',
        padding: '16px 20px',
        fontSize: '18px',
        border: '2px solid #E5E7EB',
        borderRadius: '14px',
        background: '#FAFAFA',
        transition: 'all 0.2s ease',
        outline: 'none',
        minHeight: '150px',
        resize: 'vertical',
        fontFamily: 'inherit',
    },
    select: {
        width: '100%',
        padding: '16px 20px',
        fontSize: '18px',
        border: '2px solid #E5E7EB',
        borderRadius: '14px',
        background: '#FAFAFA',
        transition: 'all 0.2s ease',
        outline: 'none',
        cursor: 'pointer',
    },
    tagInput: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px 12px',
        border: '2px solid #E5E7EB',
        borderRadius: '10px',
        background: '#FAFAFA',
        minHeight: '50px',
        alignItems: 'center',
    },
    tag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'linear-gradient(135deg, #3A4B41, #4A5D52)',
        color: '#E6CFA6',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '500',
    },
    tagRemove: {
        background: 'none',
        border: 'none',
        color: '#E6CFA6',
        cursor: 'pointer',
        padding: '0',
        fontSize: '16px',
        lineHeight: '1',
        opacity: '0.8',
    },
    tagInputField: {
        border: 'none',
        background: 'none',
        outline: 'none',
        fontSize: '14px',
        flex: '1',
        minWidth: '100px',
    },
    arrayItem: {
        background: '#F9FAFB',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E7EB',
        position: 'relative',
    },
    arrayItemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    arrayItemTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
    },
    removeButton: {
        background: 'none',
        border: 'none',
        color: '#EF4444',
        cursor: 'pointer',
        fontSize: '20px',
        padding: '4px',
        borderRadius: '4px',
    },
    addButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: '#F3F4F6',
        border: '2px dashed #D1D5DB',
        borderRadius: '10px',
        color: '#6B7280',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        justifyContent: 'center',
    },
    navigation: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #E5E7EB',
    },
    bulletList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    bulletItem: {
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
    },
    bulletInput: {
        flex: '1',
    },
    bulletRemove: {
        background: 'none',
        border: 'none',
        color: '#9CA3AF',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '8px',
    },
}

const steps = [
    { id: 1, label: 'Personal', icon: <User size={18} /> },
    { id: 2, label: 'Education', icon: <GraduationCap size={18} /> },
    { id: 3, label: 'Skills', icon: <Lightbulb size={18} /> },
    { id: 4, label: 'Experience', icon: <Briefcase size={18} /> },
    { id: 5, label: 'Projects', icon: <Rocket size={18} /> },
    { id: 6, label: 'Achievements', icon: <Trophy size={18} /> },
    { id: 7, label: 'Target Role', icon: <Target size={18} /> },
]

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
    }),
}

function ResumeForm({ formData, onChange, onGenerate, isGenerating }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [direction, setDirection] = useState(0)

    const { register, handleSubmit, watch, setValue, getValues } = useForm({
        defaultValues: formData,
    })

    // Watch all form changes and propagate to parent
    const watchedData = watch()

    const handleInputChange = (field, value) => {
        setValue(field, value)
        const newData = { ...getValues() }
        onChange(newData)
    }

    const nextStep = () => {
        if (currentStep < 7) {
            setDirection(1)
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setDirection(-1)
            setCurrentStep(currentStep - 1)
        }
    }

    const goToStep = (step) => {
        setDirection(step > currentStep ? 1 : -1)
        setCurrentStep(step)
    }

    // Tag input handlers
    const addTag = (field, value) => {
        if (!value.trim()) return
        const currentTags = getValues(field) || []
        if (!currentTags.includes(value.trim())) {
            const newTags = [...currentTags, value.trim()]
            handleInputChange(field, newTags)
        }
    }

    const removeTag = (field, index) => {
        const currentTags = getValues(field) || []
        const newTags = currentTags.filter((_, i) => i !== index)
        handleInputChange(field, newTags)
    }

    // Array field handlers
    const addArrayItem = (field, defaultItem) => {
        const currentItems = getValues(field) || []
        handleInputChange(field, [...currentItems, defaultItem])
    }

    const removeArrayItem = (field, index) => {
        const currentItems = getValues(field) || []
        handleInputChange(field, currentItems.filter((_, i) => i !== index))
    }

    const updateArrayItem = (field, index, key, value) => {
        const currentItems = getValues(field) || []
        const updatedItems = currentItems.map((item, i) =>
            i === index ? { ...item, [key]: value } : item
        )
        handleInputChange(field, updatedItems)
    }

    // Bullet point handlers
    const addBulletPoint = (expIndex) => {
        const exp = getValues('experience') || []
        const updatedExp = exp.map((e, i) =>
            i === expIndex ? { ...e, responsibilities: [...e.responsibilities, ''] } : e
        )
        handleInputChange('experience', updatedExp)
    }

    const updateBulletPoint = (expIndex, bulletIndex, value) => {
        const exp = getValues('experience') || []
        const updatedExp = exp.map((e, i) => {
            if (i === expIndex) {
                const newResponsibilities = [...e.responsibilities]
                newResponsibilities[bulletIndex] = value
                return { ...e, responsibilities: newResponsibilities }
            }
            return e
        })
        handleInputChange('experience', updatedExp)
    }

    const removeBulletPoint = (expIndex, bulletIndex) => {
        const exp = getValues('experience') || []
        const updatedExp = exp.map((e, i) => {
            if (i === expIndex) {
                return { ...e, responsibilities: e.responsibilities.filter((_, bi) => bi !== bulletIndex) }
            }
            return e
        })
        handleInputChange('experience', updatedExp)
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <h3 style={styles.sectionTitle}>PERSONAL INFORMATION</h3>
                        <p style={styles.sectionSubtitle}>Let&apos;s start with your basic contact information</p>

                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name *</label>
                                <input
                                    style={styles.input}
                                    placeholder="John Doe"
                                    value={watchedData.personal?.fullName || ''}
                                    onChange={(e) => handleInputChange('personal.fullName', e.target.value)}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email *</label>
                                <input
                                    type="email"
                                    style={styles.input}
                                    placeholder="john@email.com"
                                    value={watchedData.personal?.email || ''}
                                    onChange={(e) => handleInputChange('personal.email', e.target.value)}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone *</label>
                                <input
                                    type="tel"
                                    style={styles.input}
                                    placeholder="+1 234 567 8900"
                                    value={watchedData.personal?.phone || ''}
                                    onChange={(e) => handleInputChange('personal.phone', e.target.value)}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Location</label>
                                <input
                                    style={styles.input}
                                    placeholder="New York, NY"
                                    value={watchedData.personal?.location || ''}
                                    onChange={(e) => handleInputChange('personal.location', e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>LinkedIn URL</label>
                                <input
                                    style={styles.input}
                                    placeholder="linkedin.com/in/johndoe"
                                    value={watchedData.personal?.linkedIn || ''}
                                    onChange={(e) => handleInputChange('personal.linkedIn', e.target.value)}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>GitHub URL</label>
                                <input
                                    style={styles.input}
                                    placeholder="github.com/johndoe"
                                    value={watchedData.personal?.github || ''}
                                    onChange={(e) => handleInputChange('personal.github', e.target.value)}
                                />
                            </div>

                            <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                                <label style={styles.label}>Portfolio URL</label>
                                <input
                                    style={styles.input}
                                    placeholder="johndoe.com"
                                    value={watchedData.personal?.portfolio || ''}
                                    onChange={(e) => handleInputChange('personal.portfolio', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div>
                        <h3 style={styles.sectionTitle}>EDUCATION</h3>
                        <p style={styles.sectionSubtitle}>Add your educational background</p>

                        {(watchedData.education || []).map((edu, index) => (
                            <div key={index} style={styles.arrayItem}>
                                <div style={styles.arrayItemHeader}>
                                    <span style={styles.arrayItemTitle}>Education {index + 1}</span>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            style={styles.removeButton}
                                            onClick={() => removeArrayItem('education', index)}
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
                                            onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>College/University *</label>
                                        <input
                                            style={styles.input}
                                            placeholder="MIT"
                                            value={edu.college || ''}
                                            onChange={(e) => updateArrayItem('education', index, 'college', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Start Year</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            placeholder="2020"
                                            value={edu.startYear || ''}
                                            onChange={(e) => updateArrayItem('education', index, 'startYear', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>End Year</label>
                                        <input
                                            type="number"
                                            style={styles.input}
                                            placeholder="2024"
                                            value={edu.endYear || ''}
                                            onChange={(e) => updateArrayItem('education', index, 'endYear', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>CGPA / Percentage</label>
                                        <input
                                            style={styles.input}
                                            placeholder="3.8 / 4.0 or 85%"
                                            value={edu.cgpa || ''}
                                            onChange={(e) => updateArrayItem('education', index, 'cgpa', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            style={styles.addButton}
                            onClick={() => addArrayItem('education', { degree: '', college: '', startYear: '', endYear: '', cgpa: '' })}
                        >
                            <Plus size={18} /> Add Another Education
                        </button>
                    </div>
                )

            case 3:
                return (
                    <div>
                        <h3 style={styles.sectionTitle}>SKILLS</h3>
                        <p style={styles.sectionSubtitle}>Add your technical and soft skills (press Enter to add)</p>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Technical Skills *</label>
                            <TagInput
                                tags={watchedData.skills?.technical || []}
                                onAdd={(value) => addTag('skills.technical', value)}
                                onRemove={(index) => removeTag('skills.technical', index)}
                                placeholder="e.g., JavaScript, React, Python..."
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tools & Technologies</label>
                            <TagInput
                                tags={watchedData.skills?.tools || []}
                                onAdd={(value) => addTag('skills.tools', value)}
                                onRemove={(index) => removeTag('skills.tools', index)}
                                placeholder="e.g., Git, Docker, AWS..."
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Soft Skills</label>
                            <TagInput
                                tags={watchedData.skills?.soft || []}
                                onAdd={(value) => addTag('skills.soft', value)}
                                onRemove={(index) => removeTag('skills.soft', index)}
                                placeholder="e.g., Leadership, Communication..."
                            />
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div>
                        <h3 style={styles.sectionTitle}>EXPERIENCE</h3>
                        <p style={styles.sectionSubtitle}>Add your work experience (most recent first)</p>

                        {(watchedData.experience || []).map((exp, index) => (
                            <div key={index} style={styles.arrayItem}>
                                <div style={styles.arrayItemHeader}>
                                    <span style={styles.arrayItemTitle}>Experience {index + 1}</span>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            style={styles.removeButton}
                                            onClick={() => removeArrayItem('experience', index)}
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
                                            onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Role/Position</label>
                                        <input
                                            style={styles.input}
                                            placeholder="Software Engineer Intern"
                                            value={exp.role || ''}
                                            onChange={(e) => updateArrayItem('experience', index, 'role', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Start Date</label>
                                        <input
                                            style={styles.input}
                                            placeholder="Jan 2023"
                                            value={exp.startDate || ''}
                                            onChange={(e) => updateArrayItem('experience', index, 'startDate', e.target.value)}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>End Date</label>
                                        <input
                                            style={styles.input}
                                            placeholder="Present"
                                            value={exp.endDate || ''}
                                            onChange={(e) => updateArrayItem('experience', index, 'endDate', e.target.value)}
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
                                                    onChange={(e) => updateBulletPoint(index, bIndex, e.target.value)}
                                                />
                                                {bIndex > 0 && (
                                                    <button
                                                        type="button"
                                                        style={styles.bulletRemove}
                                                        onClick={() => removeBulletPoint(index, bIndex)}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            style={{ ...styles.addButton, marginTop: '8px' }}
                                            onClick={() => addBulletPoint(index)}
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
                            onClick={() => addArrayItem('experience', { company: '', role: '', startDate: '', endDate: '', responsibilities: [''] })}
                        >
                            <Plus size={18} /> Add Another Experience
                        </button>
                    </div>
                )

            case 5:
                return (
                    <div>
                        <h3 style={styles.sectionTitle}>PROJECTS</h3>
                        <p style={styles.sectionSubtitle}>Showcase your notable work and projects</p>

                        {(watchedData.projects || []).map((proj, index) => (
                            <div key={index} style={styles.arrayItem}>
                                <div style={styles.arrayItemHeader}>
                                    <span style={styles.arrayItemTitle}>Project {index + 1}</span>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            style={styles.removeButton}
                                            onClick={() => removeArrayItem('projects', index)}
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
                                            onChange={(e) => updateArrayItem('projects', index, 'title', e.target.value)}
                                        />
                                    </div>

                                    <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                                        <label style={styles.label}>Description</label>
                                        <textarea
                                            style={styles.textarea}
                                            placeholder="Built a full-stack e-commerce platform with..."
                                            value={proj.description || ''}
                                            onChange={(e) => updateArrayItem('projects', index, 'description', e.target.value)}
                                        />
                                    </div>

                                    <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                                        <label style={styles.label}>Tech Stack (press Enter to add)</label>
                                        <TagInput
                                            tags={proj.techStack || []}
                                            onAdd={(value) => {
                                                const projects = getValues('projects')
                                                const newTechStack = [...(proj.techStack || []), value]
                                                updateArrayItem('projects', index, 'techStack', newTechStack)
                                            }}
                                            onRemove={(tagIndex) => {
                                                const newTechStack = (proj.techStack || []).filter((_, i) => i !== tagIndex)
                                                updateArrayItem('projects', index, 'techStack', newTechStack)
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
                            onClick={() => addArrayItem('projects', { title: '', description: '', techStack: [] })}
                        >
                            <Plus size={18} /> Add Another Project
                        </button>
                    </div>
                )

            case 6:
                return (
                    <div>
                        <h3 style={styles.sectionTitle}>ACHIEVEMENTS & CERTIFICATIONS</h3>
                        <p style={styles.sectionSubtitle}>Add your notable honors, awards, and industry certifications</p>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Achievements (press Enter to add)</label>
                            <TagInput
                                tags={watchedData.achievements || []}
                                onAdd={(value) => addTag('achievements', value)}
                                onRemove={(index) => removeTag('achievements', index)}
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

            case 7:
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
                                    value={watchedData.target?.jobRole || ''}
                                    onChange={(e) => handleInputChange('target.jobRole', e.target.value)}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Experience Level</label>
                                <select
                                    style={styles.select}
                                    value={watchedData.target?.experienceLevel || 'fresher'}
                                    onChange={(e) => handleInputChange('target.experienceLevel', e.target.value)}
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

            default:
                return null
        }
    }

    return (
        <div style={styles.form}>
            {/* Progress Bar */}
            <div style={styles.progressBar}>
                <div style={styles.progressLine} />
                <div
                    style={{
                        ...styles.progressLineFill,
                        width: `${((currentStep - 1) / (steps.length - 1)) * 80}%`,
                    }}
                />
                {steps.map((step) => (
                    <div
                        key={step.id}
                        style={styles.step}
                        onClick={() => goToStep(step.id)}
                    >
                        <motion.div
                            style={{
                                ...styles.stepCircle,
                                ...(currentStep === step.id
                                    ? styles.stepCircleActive
                                    : currentStep > step.id
                                        ? styles.stepCircleCompleted
                                        : styles.stepCircleInactive),
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {currentStep > step.id ? <CheckCircle2 size={16} /> : step.icon}
                        </motion.div>
                        <span
                            style={{
                                ...styles.stepLabel,
                                ...(currentStep === step.id ? styles.stepLabelActive : {}),
                            }}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div style={styles.stepContent}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div style={styles.navigation}>
                <AnimatedButton
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    icon={<ChevronLeft size={18} />}
                    iconPosition="left"
                >
                    Previous
                </AnimatedButton>

                {currentStep < 7 ? (
                    <AnimatedButton
                        variant="primary"
                        onClick={nextStep}
                        icon={<ChevronRight size={18} />}
                        iconPosition="right"
                    >
                        Next Step
                    </AnimatedButton>
                ) : (
                    <AnimatedButton
                        variant="primary"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        icon={<Sparkles size={18} />}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Resume'}
                    </AnimatedButton>
                )}
            </div>
        </div>
    )
}

// Tag Input Component
function TagInput({ tags, onAdd, onRemove, placeholder }) {
    const [inputValue, setInputValue] = useState('')

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault()
            onAdd(inputValue.trim())
            setInputValue('')
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            onRemove(tags.length - 1)
        }
    }

    return (
        <div style={styles.tagInput}>
            {tags.map((tag, index) => (
                <motion.span
                    key={index}
                    style={styles.tag}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                >
                    {tag}
                    <button
                        type="button"
                        style={styles.tagRemove}
                        onClick={() => onRemove(index)}
                    >
                        <X size={14} />
                    </button>
                </motion.span>
            ))}
            <input
                type="text"
                style={styles.tagInputField}
                placeholder={tags.length === 0 ? placeholder : ''}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    )
}

export default ResumeForm
