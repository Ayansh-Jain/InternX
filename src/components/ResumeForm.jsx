import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User,
    GraduationCap,
    Lightbulb,
    Briefcase,
    Rocket,
    Target,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Trophy
} from 'lucide-react'

import AnimatedButton from './AnimatedButton.jsx'
import { styles } from './resume/FormStyles'

// Sub-components
import PersonalSection from './resume/PersonalSection'
import EducationSection from './resume/EducationSection'
import SkillsSection from './resume/SkillsSection'
import ExperienceSection from './resume/ExperienceSection'
import ProjectsSection from './resume/ProjectsSection'
import AchievementSection from './resume/AchievementSection'
import TargetRoleSection from './resume/TargetRoleSection'

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
    const [isParsing, setIsParsing] = useState(false)

    const { setValue, getValues, watch, reset } = useForm({
        defaultValues: formData,
    })

    const watchedData = watch()

    const handleInputChange = (field, value) => {
        setValue(field, value)
        onChange(getValues())
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

    // Handlers for child components
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

    const addTag = (field, value) => {
        const currentTags = getValues(field) || []
        if (!currentTags.includes(value.trim())) {
            handleInputChange(field, [...currentTags, value.trim()])
        }
    }

    const removeTag = (field, index) => {
        const currentTags = getValues(field) || []
        handleInputChange(field, currentTags.filter((_, i) => i !== index))
    }

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

    const handleImportResume = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setIsParsing(true)
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        try {
            const response = await fetch('http://localhost:8000/api/parse-resume', {
                method: 'POST',
                body: formDataUpload,
            })
            const result = await response.json()

            if (result.success) {
                const updatedData = {
                    ...getValues(),
                    ...result.data,
                    personal: { ...getValues().personal, ...result.data.personal },
                    skills: { ...getValues().skills, ...result.data.skills },
                }
                reset(updatedData)
                onChange(updatedData)
                alert('Resume parsed successfully! Please review the details.')
            } else {
                alert('Error parsing resume: ' + result.error)
            }
        } catch (err) {
            console.error('Import error:', err)
            alert('Failed to connect to the parsing service.')
        } finally {
            setIsParsing(false)
            e.target.value = null
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <PersonalSection
                        data={watchedData.personal}
                        onInputChange={handleInputChange}
                        onImport={handleImportResume}
                        isParsing={isParsing}
                    />
                )
            case 2:
                return (
                    <EducationSection
                        data={watchedData.education}
                        onAdd={addArrayItem}
                        onRemove={removeArrayItem}
                        onUpdate={updateArrayItem}
                    />
                )
            case 3:
                return (
                    <SkillsSection
                        data={watchedData.skills}
                        onAddTag={addTag}
                        onRemoveTag={removeTag}
                    />
                )
            case 4:
                return (
                    <ExperienceSection
                        data={watchedData.experience}
                        onAdd={addArrayItem}
                        onRemove={removeArrayItem}
                        onUpdate={updateArrayItem}
                        onAddBullet={addBulletPoint}
                        onUpdateBullet={updateBulletPoint}
                        onRemoveBullet={removeBulletPoint}
                    />
                )
            case 5:
                return (
                    <ProjectsSection
                        data={watchedData.projects}
                        onAdd={addArrayItem}
                        onRemove={removeArrayItem}
                        onUpdate={updateArrayItem}
                    />
                )
            case 6:
                return (
                    <AchievementSection
                        data={watchedData.achievements}
                        onAddTag={addTag}
                        onRemoveTag={removeTag}
                    />
                )
            case 7:
                return (
                    <TargetRoleSection
                        data={watchedData.target}
                        onInputChange={handleInputChange}
                    />
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

export default ResumeForm
