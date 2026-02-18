import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Linkedin, Github,
    Globe, Edit, Upload, FileText, Download,
    CheckCircle, Award, Briefcase, GraduationCap,
    Code, Star, ChevronRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { profileAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const styles = {
    page: {
        minHeight: '100vh',
        background: '#F9FAFB',
        paddingTop: '100px',
        paddingBottom: '40px',
    },
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 24px',
    },
    headerCard: {
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
    },
    avatarWrapper: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E6CFA6',
        fontSize: '48px',
        fontWeight: 'bold',
        position: 'relative',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        width: '16px',
        height: '16px',
        background: '#10B981',
        border: '3px solid white',
        borderRadius: '50%',
    },
    nameSection: {
        flex: 1,
    },
    fullName: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '36px',
        color: '#3A4B41',
        letterSpacing: '1px',
        marginBottom: '4px',
    },
    roleTitle: {
        fontSize: '18px',
        color: '#6B7280',
        fontWeight: '500',
    },
    mainGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '32px',
    },
    section: {
        background: 'white',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '20px',
        color: '#3A4B41',
        letterSpacing: '0.5px',
        marginBottom: '20px',
        borderBottom: '1px solid #F3F4F6',
        paddingBottom: '12px',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: '#F9FAFB',
        borderRadius: '12px',
    },
    infoIcon: {
        color: '#3A4B41',
        opacity: 0.7,
    },
    infoText: {
        fontSize: '14px',
        color: '#374151',
    },
    infoLabel: {
        fontSize: '12px',
        color: '#9CA3AF',
        display: 'block',
    },
    resumeCard: {
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        borderRadius: '20px',
        padding: '28px',
        color: 'white',
        textAlign: 'center',
    },
    resumeScore: {
        fontSize: '64px',
        fontWeight: 'bold',
        color: '#E6CFA6',
        lineHeight: 1,
    },
    uploadBtn: {
        width: '100%',
        padding: '14px',
        marginTop: '20px',
        background: '#E6CFA6',
        color: '#3A4B41',
        border: 'none',
        borderRadius: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'transform 0.2s',
    },
    secondaryBtn: {
        width: '100%',
        padding: '12px',
        marginTop: '12px',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    }
};

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isParsing, setIsParsing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await profileAPI.get();
            setProfile(res.data);
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImportResume = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/parse-resume', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (result.success) {
                // Save the parsed data to the profile
                try {
                    const updateRes = await profileAPI.update({
                        resumeData: result.data
                    });

                    // Update global user state (AuthContext)
                    if (updateUser) {
                        updateUser(updateRes.data);
                    }

                    alert('Resume parsed successfully! Your profile has been updated.');
                    fetchProfile();
                } catch (saveErr) {
                    console.error('Error saving profile:', saveErr);
                    alert('Parsed successfully, but failed to save to profile.');
                }
            } else {
                alert('Error parsing resume: ' + result.error);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to connect to the parsing service.');
        } finally {
            setIsParsing(false);
            e.target.value = null;
        }
    };

    if (loading) return <div>Loading...</div>;

    const initials = profile?.profile?.fullName?.split(' ').map(n => n[0]).join('') || '?';

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Header Profile Section */}
                <motion.div
                    style={styles.headerCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={styles.avatarWrapper}>
                        {initials}
                        <div style={styles.onlineBadge}></div>
                    </div>
                    <div style={styles.nameSection}>
                        <h1 style={styles.fullName}>{profile?.profile?.fullName || 'Anonymous User'}</h1>
                        <div style={styles.roleTitle}>
                            {profile?.profile?.resumeData?.target?.jobRole || 'Professional'} • {profile?.role}
                        </div>
                    </div>
                    <button
                        style={{ ...styles.uploadBtn, width: 'auto', padding: '10px 20px', background: '#F3F4F6' }}
                        onClick={() => navigate('/builder')}
                    >
                        <Edit size={16} /> Edit Profile
                    </button>
                </motion.div>

                <div style={styles.mainGrid}>
                    <div className="left-col">
                        {/* Contact Info */}
                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}><User size={20} /> BASIC INFORMATION</h2>
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}>
                                    <Mail style={styles.infoIcon} size={18} />
                                    <div>
                                        <span style={styles.infoLabel}>Email</span>
                                        <span style={styles.infoText}>{profile?.email}</span>
                                    </div>
                                </div>
                                <div style={styles.infoItem}>
                                    <Phone style={styles.infoIcon} size={18} />
                                    <div>
                                        <span style={styles.infoLabel}>Phone</span>
                                        <span style={styles.infoText}>{profile?.profile?.resumeData?.personal?.phone || 'Not provided'}</span>
                                    </div>
                                </div>
                                <div style={styles.infoItem}>
                                    <MapPin style={styles.infoIcon} size={18} />
                                    <div>
                                        <span style={styles.infoLabel}>Location</span>
                                        <span style={styles.infoText}>{profile?.profile?.resumeData?.personal?.location || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Education */}
                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}><GraduationCap size={20} /> EDUCATION</h2>
                            {profile?.profile?.resumeData?.education?.map((edu, i) => (
                                <div key={i} style={{ marginBottom: '16px', padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: '600', color: '#3A4B41' }}>{edu.degree}</div>
                                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{edu.college}</div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{edu.startYear} - {edu.endYear}</div>
                                </div>
                            )) || <p style={{ color: '#9CA3AF' }}>No education details found.</p>}
                        </section>

                        {/* Experience */}
                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}><Briefcase size={20} /> EXPERIENCE</h2>
                            {profile?.profile?.resumeData?.experience?.map((exp, i) => (
                                <div key={i} style={{ marginBottom: '16px', padding: '12px', background: '#F9FAFB', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: '600', color: '#3A4B41' }}>{exp.role}</div>
                                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{exp.company}</div>
                                    <ul style={{ marginTop: '8px', paddingLeft: '16px', fontSize: '13px', color: '#4B5563' }}>
                                        {exp.responsibilities?.map((res, j) => <li key={j}>{res}</li>)}
                                    </ul>
                                </div>
                            )) || <p style={{ color: '#9CA3AF' }}>No experience details found.</p>}
                        </section>
                    </div>

                    <div className="right-col">
                        {/* Resume Parsing Option */}
                        <div style={styles.resumeCard}>
                            <FileText size={48} style={{ margin: '0 auto 16px', color: '#E6CFA6' }} />
                            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '1px' }}>RESUME STATUS</h3>

                            <div style={{ margin: '20px 0' }}>
                                <div style={styles.resumeScore}>{profile?.score?.total_score || 0}</div>
                                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>ATS SCORE</div>
                            </div>

                            <label style={styles.uploadBtn}>
                                {isParsing ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                {isParsing ? 'PARSING...' : 'UPLOAD EXISTING PDF'}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    hidden
                                    onChange={handleImportResume}
                                    disabled={isParsing}
                                />
                            </label>

                            <button style={styles.secondaryBtn} onClick={() => navigate('/builder')}>
                                <Edit size={18} /> OPEN BUILDER
                            </button>

                            <p style={{ marginTop: '16px', fontSize: '11px', opacity: 0.7 }}>
                                Uploading a PDF will automatically populate your profile using our AI parser.
                            </p>
                        </div>

                        {/* Skills */}
                        <section style={{ ...styles.section, marginTop: '24px' }}>
                            <h2 style={styles.sectionTitle}><Code size={20} /> CORE SKILLS</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {profile?.profile?.resumeData?.skills?.technical?.map((skill, i) => (
                                    <span key={i} style={{ padding: '6px 12px', background: '#3A4B41', color: '#E6CFA6', fontSize: '12px', borderRadius: '20px' }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Profile Completeness */}
                        <section style={styles.section}>
                            <h2 style={styles.sectionTitle}><Star size={20} /> QUICK LINKS</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {profile?.profile?.resumeData?.personal?.linkedIn && (
                                    <a href={profile.profile.resumeData.personal.linkedIn} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#3A4B41' }}>
                                        <Linkedin size={18} /> LinkedIn Profile
                                    </a>
                                )}
                                {profile?.profile?.resumeData?.personal?.github && (
                                    <a href={profile.profile.resumeData.personal.github} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#3A4B41' }}>
                                        <Github size={18} /> GitHub Repository
                                    </a>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes animate-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: animate-spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Profile;
