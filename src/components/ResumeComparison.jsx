import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, CheckCircle, FileText, Download, Upload } from 'lucide-react';
import CustomizedResumePreview from './CustomizedResumePreview';
import { resumeAPI } from '../services/api';

const ResumeComparison = ({ originalData, tailoredData, onComplete, onDownloadPdf, onDownloadWord, onUploadDb, isSubmittingApp }) => {
    const [decisions, setDecisions] = useState({});

    // Initialize all decisions to null (undecided)
    // Keys format: type-index-bulletIndex (e.g., exp-0-0)

    const handleDecision = (key, decision) => {
        setDecisions(prev => ({ ...prev, [key]: decision }));
    };

    const handleAcceptAll = () => {
        const newDecisions = { ...decisions };
        ['experience', 'projects'].forEach(section => {
            if (tailoredData[section]) {
                tailoredData[section].forEach((item, itemIdx) => {
                    if (item.bullets) {
                        item.bullets.forEach((bullet, bulletIdx) => {
                            if (bullet.is_modified) {
                                newDecisions[`${section}-${itemIdx}-${bulletIdx}`] = 'accepted';
                            }
                        });
                    }
                });
            }
        });
        setDecisions(newDecisions);
    };

    const generateHybridData = () => {
        const hybrid = JSON.parse(JSON.stringify(tailoredData));
        
        ['experience', 'projects'].forEach(section => {
            if (hybrid[section]) {
                hybrid[section].forEach((item, itemIdx) => {
                    if (item.bullets) {
                        const newBullets = [];
                        item.bullets.forEach((bullet, bulletIdx) => {
                            const key = `${section}-${itemIdx}-${bulletIdx}`;
                            const decision = decisions[key];
                            
                            // If rejected, use original. Otherwise (accepted or undecided), use tailored.
                            if (bullet.is_modified && decision === 'rejected') {
                                newBullets.push({ text: bullet.original_text });
                            } else {
                                if (bullet.formatting && bullet.formatting.length > 0) {
                                    newBullets.push(bullet.formatting);
                                } else {
                                    newBullets.push({ text: bullet.tailored_text || bullet.original_text });
                                }
                            }
                        });
                        item.bullets = newBullets;
                    }
                });
            }
        });
        
        return {
            ...originalData,
            ...hybrid
        };
    };

    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const renderTailoredContent = () => {
        // Render right side with interactive boxes
        return (
            <div style={{ padding: '16px', background: '#F9FAFB', minHeight: '100%' }}>
                <div style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', minHeight: '100%', fontSize: '12px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#3A4B41', borderBottom: '2px solid #E5E7EB', paddingBottom: '8px' }}>
                        AI-Tailored Resume
                    </h2>
                <div style={{ marginBottom: '16px', fontSize: '11px', color: '#6B7280' }}>
                    Review the AI suggested changes below. Highlighted sections have been modified to better match the job description.
                </div>

                {['experience', 'projects'].map(section => (
                    tailoredData[section] && tailoredData[section].length > 0 && (
                        <div key={section} style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#1F2937', marginBottom: '12px', borderBottom: '1px solid #E5E7EB' }}>
                                {section}
                            </h3>
                            {tailoredData[section].map((item, itemIdx) => (
                                <div key={itemIdx} style={{ marginBottom: '16px' }}>
                                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.role || item.title}</div>
                                    <div style={{ color: '#6B7280', marginBottom: '8px' }}>{item.company} {item.startDate ? `| ${item.startDate} - ${item.endDate}` : ''}</div>
                                    
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        {item.bullets && item.bullets.map((bullet, bulletIdx) => {
                                            const key = `${section}-${itemIdx}-${bulletIdx}`;
                                            const decision = decisions[key];
                                            const isModified = bullet.is_modified;

                                            if (!isModified) {
                                                return (
                                                    <li key={bulletIdx} style={{ marginBottom: '6px', color: '#374151' }}>
                                                        {bullet.original_text}
                                                    </li>
                                                );
                                            }

                                            // Highlighted box for modified content
                                            let bgColor = '#F0FDF4'; // Light green for pending/accepted
                                            let borderColor = '#86EFAC';
                                            if (decision === 'rejected') {
                                                bgColor = '#FEF2F2';
                                                borderColor = '#FCA5A5';
                                            } else if (decision === 'accepted') {
                                                bgColor = '#ECFDF5';
                                                borderColor = '#10B981';
                                            }

                                            return (
                                                <li key={bulletIdx} style={{ marginBottom: '12px', listStyle: 'none', marginLeft: '-20px' }}>
                                                    <div style={{ 
                                                        border: `1px solid ${borderColor}`, 
                                                        backgroundColor: bgColor,
                                                        borderRadius: '8px', 
                                                        padding: '12px',
                                                        position: 'relative'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                            <div style={{ fontSize: '10px', color: '#6B7280', background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E5E7EB', display: 'inline-block' }}>
                                                                💡 {bullet.change_reason || 'AI modified this phrase for better alignment.'}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button 
                                                                    onClick={() => handleDecision(key, 'accepted')}
                                                                    style={{ 
                                                                        background: decision === 'accepted' ? '#10B981' : 'white',
                                                                        color: decision === 'accepted' ? 'white' : '#10B981',
                                                                        border: '1px solid #10B981',
                                                                        borderRadius: '4px',
                                                                        padding: '4px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                    }}
                                                                    title="Accept change"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDecision(key, 'rejected')}
                                                                    style={{ 
                                                                        background: decision === 'rejected' ? '#EF4444' : 'white',
                                                                        color: decision === 'rejected' ? 'white' : '#EF4444',
                                                                        border: '1px solid #EF4444',
                                                                        borderRadius: '4px',
                                                                        padding: '4px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                    }}
                                                                    title="Reject change"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {decision === 'rejected' ? (
                                                            <div style={{ color: '#9CA3AF', textDecoration: 'line-through' }}>
                                                                {bullet.tailored_text}
                                                            </div>
                                                        ) : (
                                                            <div style={{ color: '#1F2937' }}>
                                                                {bullet.formatting ? bullet.formatting.map((fmt, i) => (
                                                                    <span key={i} style={{ fontWeight: fmt.bold ? 'bold' : 'normal' }}>
                                                                        {fmt.text}
                                                                    </span>
                                                                )) : bullet.tailored_text}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )
                ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
                {/* Left Side: Original */}
                <div style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
                    <div style={{ padding: '16px 20px', background: '#F3F4F6', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                        Original Profile Resume
                    </div>
                    <div style={{ overflowY: 'auto', height: '750px', padding: '24px' }}>
                        <div style={{ background: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '4px' }}>
                            <CustomizedResumePreview data={originalData} rawData={originalData} template="classic" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Tailored & Interactive */}
                <div style={{ flex: 1, border: '1px solid #10B981', borderRadius: '12px', overflow: 'hidden', height: '815px', display: 'flex', flexDirection: 'column', background: '#F9FAFB' }}>
                    <div style={{ padding: '16px 20px', background: '#ECFDF5', borderBottom: '1px solid #10B981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#065F46', fontSize: '14px' }}>AI Optimization Review</span>
                        <button 
                            onClick={handleAcceptAll}
                            style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                        >
                            Accept All Changes
                        </button>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {renderTailoredContent()}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    {isAllDecided() ? 'All changes reviewed.' : 'Please review all highlighted changes.'}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={async () => {
                            setIsDownloadingPdf(true);
                            try {
                                const hybrid = generateHybridData();
                                await onDownloadPdf(hybrid);
                            } finally {
                                setIsDownloadingPdf(false);
                            }
                        }}
                        disabled={isSubmittingApp || isDownloadingPdf}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', 
                            padding: '10px 16px', borderRadius: '8px', cursor: (isSubmittingApp || isDownloadingPdf) ? 'not-allowed' : 'pointer', fontWeight: '500',
                            opacity: (isSubmittingApp || isDownloadingPdf) ? 0.6 : 1
                        }}
                    >
                        <Download size={16} /> {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
                    </button>
                    <button 
                        onClick={() => {
                            const hybrid = generateHybridData();
                            onDownloadWord(hybrid);
                        }}
                        disabled={isSubmittingApp}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', 
                            padding: '10px 16px', borderRadius: '8px', cursor: isSubmittingApp ? 'not-allowed' : 'pointer', fontWeight: '500',
                            opacity: isSubmittingApp ? 0.6 : 1
                        }}
                    >
                        <FileText size={16} /> Download Word
                    </button>
                    <button 
                        onClick={() => {
                            const hybrid = generateHybridData();
                            onUploadDb(hybrid);
                        }}
                        disabled={isSubmittingApp}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)', color: '#E6CFA6', border: 'none', 
                            padding: '10px 16px', borderRadius: '8px', cursor: isSubmittingApp ? 'not-allowed' : 'pointer', fontWeight: '500',
                            opacity: isSubmittingApp ? 0.6 : 1
                        }}
                    >
                        <Upload size={16} /> Save & Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeComparison;
