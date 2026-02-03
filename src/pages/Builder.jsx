import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, FileDown } from 'lucide-react'
import ResumeForm from '../components/ResumeForm.jsx'
import ResumePreview from '../components/ResumePreview.jsx'
import TemplateSelector from '../components/TemplateSelector.jsx'
import ScoreCard from '../components/ScoreCard.jsx'
import FeedbackPanel from '../components/FeedbackPanel.jsx'
import AnimatedButton from '../components/AnimatedButton.jsx'
import { useAuth } from '../contexts/AuthContext'
import { profileAPI, authAPI } from '../services/api'
import { Save } from 'lucide-react'

const styles = {
    builder: {
        paddingTop: '73px',
        minHeight: '100vh',
        background: '#F9FAFB',
    },
    container: {
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    header: {
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '4rem',
        color: '#3A4B41',
        letterSpacing: '2px',
    },
    actions: {
        display: 'flex',
        gap: '12px',
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        alignItems: 'start',
    },
    leftPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    rightPanel: {
        position: 'sticky',
        top: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    },
    previewContainer: {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        minHeight: '600px',
    },
    templateSection: {
        marginBottom: '24px',
    },
    sectionTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '2.5rem',
        color: '#3A4B41',
        marginBottom: '20px',
        letterSpacing: '1.5px',
    },
    resultsPanel: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
}

const defaultFormData = {
    personal: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedIn: '',
        github: '',
        portfolio: '',
    },
    education: [{
        degree: '',
        college: '',
        startYear: '',
        endYear: '',
        cgpa: '',
    }],
    skills: {
        technical: [],
        tools: [],
        soft: [],
    },
    experience: [{
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        responsibilities: [''],
    }],
    projects: [{
        title: '',
        description: '',
        techStack: [],
        achievements: '',
    }],
    target: {
        jobRole: '',
        experienceLevel: 'fresher',
    },
}

function Builder() {
    const { user, isAuthenticated, updateUser } = useAuth()
    const [formData, setFormData] = useState(defaultFormData)
    const [selectedTemplate, setSelectedTemplate] = useState('classic')
    const [resumeScore, setResumeScore] = useState(null)
    const [feedback, setFeedback] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Load user data if authenticated
    useEffect(() => {
        if (isAuthenticated && user?.profile?.resumeData) {
            setFormData(user.profile.resumeData)
        }
    }, [isAuthenticated, user])

    const handleFormChange = useCallback((newData) => {
        setFormData(newData)
    }, [])

    const handleGenerateResume = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch('http://localhost:8000/api/generate-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const result = await response.json()
            if (result.optimizedData) {
                setFormData(prev => ({ ...prev, ...result.optimizedData }))
            }
        } catch (error) {
            console.log('Backend not connected, using local data')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleAnalyzeResume = async () => {
        setIsAnalyzing(true)
        try {
            const response = await fetch('http://localhost:8000/api/analyze-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const result = await response.json()
            setResumeScore(result.score)
            setFeedback(result.feedback)
        } catch (error) {
            // Fallback: local scoring
            const score = calculateLocalScore(formData)
            setResumeScore(score.total)
            setFeedback(score.feedback)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const calculateLocalScore = (data) => {
        let score = 0
        const feedback = []

        // Section completeness (15 points)
        let completeness = 0
        if (data.personal.fullName && data.personal.email) completeness += 3
        if (data.education[0]?.degree) completeness += 3
        if (data.skills.technical.length > 0) completeness += 3
        if (data.experience[0]?.company) completeness += 3
        if (data.target.jobRole) completeness += 3
        score += completeness

        if (completeness < 15) {
            feedback.push({ type: 'warning', message: 'Complete all sections for a better score' })
        }

        // Keywords (25 points) - simplified check
        const technicalSkillsCount = data.skills.technical.length
        const keywordScore = Math.min(25, technicalSkillsCount * 5)
        score += keywordScore

        if (technicalSkillsCount < 5) {
            feedback.push({ type: 'improve', message: 'Add more technical skills relevant to your target role' })
        }

        // Quantification (20 points)
        const expText = data.experience.map(e => e.responsibilities.join(' ')).join(' ')
        const numberCount = (expText.match(/\d+/g) || []).length
        const quantScore = Math.min(20, numberCount * 4)
        score += quantScore

        if (numberCount < 3) {
            feedback.push({ type: 'improve', message: 'Add numbers and metrics to quantify your achievements' })
        }

        // Action verbs (10 points)
        const actionVerbs = ['led', 'developed', 'created', 'managed', 'implemented', 'designed', 'built', 'increased', 'reduced', 'achieved']
        const expLower = expText.toLowerCase()
        const actionVerbCount = actionVerbs.filter(verb => expLower.includes(verb)).length
        const actionScore = Math.min(10, actionVerbCount * 2)
        score += actionScore

        if (actionVerbCount < 3) {
            feedback.push({ type: 'improve', message: 'Start bullet points with strong action verbs' })
        }

        // ATS Readability (15 points) - based on structure
        let atsScore = 15
        if (!data.personal.email.includes('@')) atsScore -= 5
        if (data.personal.phone.length < 10) atsScore -= 5
        score += atsScore

        // Grammar placeholder (15 points) - giving base score
        score += 12
        feedback.push({ type: 'tip', message: 'Proofread for grammar and spelling errors' })

        if (score > 70) {
            feedback.unshift({ type: 'success', message: 'Great job! Your resume is well-optimized' })
        }

        return { total: Math.min(100, score), feedback }
    }

    const handleExportPDF = async () => {
        const html2pdf = (await import('html2pdf.js')).default
        const element = document.getElementById('resume-preview')

        const opt = {
            margin: 0.5,
            filename: `${formData.personal.fullName || 'resume'}_InternX.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        }

        html2pdf().set(opt).from(element).save()
    }

    const handleSaveProfile = async () => {
        if (!isAuthenticated) return
        setIsSaving(true)
        try {
            await profileAPI.update({ resumeData: formData })
            const me = await authAPI.getMe()
            updateUser(me.data)
            alert('Resume saved to your profile!')
        } catch (error) {
            alert('Failed to save resume: ' + (error.response?.data?.detail || error.message))
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div style={styles.builder}>
            <div style={styles.container}>
                <motion.div
                    style={styles.header}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 style={styles.title}>BUILD YOUR RESUME</h1>
                    <div style={styles.actions}>
                        {isAuthenticated && (
                            <AnimatedButton
                                variant="secondary"
                                size="small"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                icon={<Save size={18} />}
                            >
                                {isSaving ? 'Saving...' : 'Save to Profile'}
                            </AnimatedButton>
                        )}
                        <AnimatedButton
                            variant="secondary"
                            size="small"
                            onClick={handleAnalyzeResume}
                            disabled={isAnalyzing}
                            icon={<BarChart3 size={18} />}
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Score'}
                        </AnimatedButton>
                        <AnimatedButton
                            variant="primary"
                            size="small"
                            onClick={handleExportPDF}
                            icon={<FileDown size={18} />}
                        >
                            Download PDF
                        </AnimatedButton>
                    </div>
                </motion.div>

                <div style={styles.layout} className="builder-layout">
                    <motion.div
                        style={styles.leftPanel}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={styles.card}>
                            <ResumeForm
                                formData={formData}
                                onChange={handleFormChange}
                                onGenerate={handleGenerateResume}
                                isGenerating={isGenerating}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        style={styles.rightPanel}
                        className="right-panel"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div style={styles.templateSection}>
                            <h3 style={styles.sectionTitle}>SELECT TEMPLATE</h3>
                            <TemplateSelector
                                selected={selectedTemplate}
                                onSelect={setSelectedTemplate}
                            />
                        </div>

                        <div style={styles.previewContainer}>
                            <ResumePreview
                                data={formData}
                                template={selectedTemplate}
                            />
                        </div>

                        {(resumeScore !== null || feedback) && (
                            <div style={styles.resultsPanel}>
                                <ScoreCard score={resumeScore} />
                                <FeedbackPanel feedback={feedback} />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .builder-layout {
            grid-template-columns: 1fr !important;
          }
          .right-panel {
            position: static !important;
          }
        }
      `}</style>
        </div>
    )
}

export default Builder
