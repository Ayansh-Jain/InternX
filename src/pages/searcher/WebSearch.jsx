/**
 * WebSearch.jsx — Dedicated AI-powered web opportunity search page.
 * Lets searchers find real jobs/internships on LinkedIn, Indeed, Internshala, etc.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, MapPin, Briefcase, Globe, ChevronRight, ArrowLeft,
    Building, ExternalLink, Sparkles, Clock, AlertCircle, X, Wifi
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { searchAPI, externalJobsAPI } from '../../services/api';

/* ─── Styles ─── */
const S = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #F0F4F2 0%, #F9FAFB 60%, #EEF2FF 100%)',
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        padding: '16px 24px',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
    logo: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
    logoIcon: {
        width: '36px', height: '36px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#E6CFA6', fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px',
    },
    logoText: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '24px', color: '#3A4B41', letterSpacing: '1px',
    },
    badge: {
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        color: 'white', padding: '4px 12px', borderRadius: '20px',
        fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px',
    },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px', background: '#F3F4F6',
        border: 'none', borderRadius: '8px', cursor: 'pointer',
        fontSize: '14px', color: '#374151', fontWeight: '500',
    },
    body: { paddingTop: '88px', maxWidth: '900px', margin: '0 auto', padding: '88px 24px 48px' },

    /* Hero */
    hero: { textAlign: 'center', marginBottom: '40px' },
    heroIcon: {
        width: '64px', height: '64px', borderRadius: '20px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #6366F1 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
        boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
    },
    heroTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '40px', color: '#3A4B41', letterSpacing: '1.5px', marginBottom: '8px',
    },
    heroSub: { fontSize: '15px', color: '#6B7280', lineHeight: '1.6' },

    /* Form card */
    formCard: {
        background: 'white', borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        marginBottom: '32px',
        border: '1px solid #F0F0F0',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px',
    },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    formGroupFull: { display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' },
    input: {
        padding: '13px 16px', fontSize: '14px',
        border: '2px solid #E5E7EB', borderRadius: '10px',
        outline: 'none', transition: 'border-color 0.2s',
        background: '#FAFAFA', color: '#1F2937',
        fontFamily: 'inherit',
    },
    select: {
        padding: '13px 16px', fontSize: '14px',
        border: '2px solid #E5E7EB', borderRadius: '10px',
        outline: 'none', background: '#FAFAFA', color: '#1F2937',
        cursor: 'pointer', fontFamily: 'inherit',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '40px',
    },

    /* Work mode radiob group */
    radioGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    radioBtn: {
        padding: '8px 18px', border: '2px solid #E5E7EB',
        borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
        fontWeight: '500', color: '#6B7280', background: 'white',
        transition: 'all 0.15s ease',
    },
    radioBtnActive: {
        border: '2px solid #3A4B41', background: '#3A4B41', color: '#E6CFA6',
    },

    searchBtn: {
        width: '100%', padding: '15px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        color: '#E6CFA6', border: 'none', borderRadius: '12px',
        fontSize: '15px', fontWeight: '700', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '10px', letterSpacing: '0.5px', transition: 'all 0.2s ease',
        boxShadow: '0 4px 16px rgba(58,75,65,0.3)',
    },
    searchBtnDisabled: {
        background: '#9CA3AF', boxShadow: 'none', cursor: 'not-allowed',
    },

    /* Results */
    resultsHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
    },
    resultsTitle: {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '24px', color: '#3A4B41', letterSpacing: '1px',
    },
    resultsMeta: { fontSize: '13px', color: '#6B7280' },

    resultCard: {
        background: 'white', borderRadius: '14px',
        border: '1px solid #E5E7EB',
        padding: '22px', marginBottom: '14px',
        transition: 'all 0.2s ease',
        position: 'relative', overflow: 'hidden',
    },
    resultCardHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '12px',
    },
    resultTitle: { fontSize: '17px', fontWeight: '700', color: '#1F2937', marginBottom: '3px' },
    resultCompany: {
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '14px', color: '#6B7280',
    },
    sourceBadge: {
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 12px', borderRadius: '20px',
        fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    metaRow: {
        display: 'flex', flexWrap: 'wrap', gap: '12px',
        marginBottom: '12px',
    },
    metaItem: {
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '13px', color: '#6B7280',
        background: '#F9FAFB', padding: '4px 10px', borderRadius: '6px',
    },
    description: {
        fontSize: '13px', color: '#6B7280', lineHeight: '1.6',
        marginBottom: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '12px',
    },
    applyBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        padding: '10px 20px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #3A4B41 0%, #4A5D52 100%)',
        color: '#E6CFA6', textDecoration: 'none',
        fontSize: '13px', fontWeight: '600',
        transition: 'all 0.2s ease',
    },

    /* States */
    loadingBox: {
        textAlign: 'center', padding: '60px 20px',
        background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB',
    },
    spinner: {
        width: '40px', height: '40px',
        border: '3px solid #E5E7EB',
        borderTop: '3px solid #3A4B41',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
        margin: '0 auto 16px',
    },
    errorBox: {
        padding: '16px 20px', background: '#FEF2F2',
        border: '1px solid #FECACA', borderRadius: '10px',
        color: '#DC2626', fontSize: '14px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '10px',
    },
    emptyBox: {

        textAlign: 'center', padding: '60px 40px',
        background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB',
        color: '#6B7280',
    },
    tipBox: {
        marginTop: '32px',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'left',
    },
    tipTitle: {
        color: '#334155', fontSize: '15px', fontWeight: '700',
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
    },
    tipList: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
    },
    tipItem: {
        fontSize: '13px', color: '#64748B', display: 'flex', gap: '8px', alignItems: 'flex-start',
    },
    tipDot: {
        width: '6px', height: '6px', background: '#94A3B8', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
    },

    verifiedDot: {
        position: 'absolute', top: 0, left: 0,
        width: '4px', height: '100%',
        background: 'linear-gradient(180deg, #059669, #34D399)',
        borderRadius: '14px 0 0 14px',
    },
};

const OPPORTUNITY_TYPES = [
    { value: '', label: 'Select type...' },
    { value: 'internship', label: '🎓 Internship' },
    { value: 'full-time', label: '💼 Full-Time Job' },
    { value: 'part-time', label: '⏰ Part-Time' },
    { value: 'hackathon', label: '🚀 Hackathon' },
    { value: 'contract', label: '📋 Contract / Freelance' },
    { value: 'remote', label: '🌐 Remote Job' },
    { value: 'government', label: '🏛️ Government / Sarkari Job' },
];

const WORK_MODES = ['Any', 'Onsite', 'Remote', 'Hybrid'];

const SOURCE_COLORS = {
    LinkedIn:       { bg: '#DBEAFE', color: '#1D4ED8' },
    Indeed:         { bg: '#FEF9C3', color: '#92400E' },
    Internshala:    { bg: '#D1FAE5', color: '#065F46' },
    Unstop:         { bg: '#EDE9FE', color: '#5B21B6' },
    Naukri:         { bg: '#FEE2E2', color: '#9B1C1C' },
    Wellfound:      { bg: '#FCE7F3', color: '#9D174D' },
    Glassdoor:      { bg: '#ECFDF5', color: '#064E3B' },
    Devfolio:       { bg: '#F3E8FF', color: '#6B21A8' },
    'NCS Gov':      { bg: '#FFF7ED', color: '#C2410C' },
    'Sarkari Result': { bg: '#ECFDF5', color: '#065F46' },
    UPSC:           { bg: '#EFF6FF', color: '#1E40AF' },
    SSC:            { bg: '#F5F3FF', color: '#5B21B6' },
    IBPS:           { bg: '#FFF1F2', color: '#BE123C' },
    'Naukri Gov':   { bg: '#FEF2F2', color: '#991B1B' },
};

function getSourceStyle(source) {
    return SOURCE_COLORS[source] || { bg: '#F3F4F6', color: '#374151' };
}


const formatRelativeDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 10) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};


/* ─── Component ─── */
export default function WebSearch() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [form, setForm] = useState({
        opportunityType: '',
        role: '',
        area: '',
        workMode: 'Any',
    });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [queryUsed, setQueryUsed] = useState('');
    const [sourceUsed, setSourceUsed] = useState('');
    // Track saved / applied state per result (keyed by ext_id)
    const [savedSet, setSavedSet] = useState(new Set());
    const [appliedSet, setAppliedSet] = useState(new Set());
    const [actionLoading, setActionLoading] = useState(new Set()); // IDs currently loading

    const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSearch = async () => {
        if (!form.role.trim() && !form.opportunityType) {
            setError('Please enter a role or select an opportunity type to search.');
            return;
        }
        setLoading(true);
        setError('');
        setResults([]);
        setSearched(false);

        const q = [form.role.trim(), form.opportunityType].filter(Boolean).join(' ') || 'opportunities';
        const location = form.area.trim() || undefined;
        const job_type = form.opportunityType || undefined;
        const work_mode = form.workMode !== 'Any' ? form.workMode.toLowerCase() : undefined;

        setQueryUsed(q);

        try {
            const params = { q };
            if (location) params.location = location;
            if (job_type) params.job_type = job_type;
            if (work_mode) params.work_mode = work_mode;

            const res = await searchAPI.external(params);
            setResults(res.data.results || []);
            setSourceUsed(res.data.source || '');
            setSearched(true);
        } catch (err) {
            setError('Search failed. Please make sure the backend is running and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => { await logout(); navigate('/signin'); };

    // Build a compact payload for the backend from a result card
    const toPayload = (r) => ({
        ext_id: r.id || `${r.source}-${r.title}`,
        title: r.title,
        company: r.company,
        location: r.location,
        job_type: r.type,
        salary: r.salary,
        source: r.source,
        apply_url: r.apply_url,
        description_snippet: r.description_snippet,
        is_verified: r.is_verified || false,
    });

    const setLoading1 = (id, on) => setActionLoading(prev => {
        const next = new Set(prev);
        on ? next.add(id) : next.delete(id);
        return next;
    });

    const handleSave = async (r) => {
        const id = r.id;
        setLoading1(id, true);
        try {
            if (savedSet.has(id)) {
                await externalJobsAPI.unsave(id);
                setSavedSet(prev => { const n = new Set(prev); n.delete(id); return n; });
            } else {
                await externalJobsAPI.save(toPayload(r));
                setSavedSet(prev => new Set([...prev, id]));
            }
        } catch (e) { console.error('Save error', e); }
        finally { setLoading1(id, false); }
    };

    const handleMarkApplied = async (r) => {
        const id = r.id;
        setLoading1(id, true);
        try {
            if (appliedSet.has(id)) {
                await externalJobsAPI.unmarkApplied(id);
                setAppliedSet(prev => { const n = new Set(prev); n.delete(id); return n; });
            } else {
                await externalJobsAPI.markApplied(toPayload(r));
                setAppliedSet(prev => new Set([...prev, id]));
            }
        } catch (e) { console.error('Applied error', e); }
        finally { setLoading1(id, false); }
    };

    return (
        <div style={S.page}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
                .web-input:focus { border-color: #3A4B41 !important; background: white !important; }
                .apply-link:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(58,75,65,0.25); }
                .result-card:hover { border-color: #3A4B41; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
                .back-btn:hover { background: #E5E7EB !important; }
                .search-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(58,75,65,0.4) !important; }
            `}</style>

            {/* ─── Header ─── */}
            <header style={S.header}>
                <div style={S.headerLeft}>
                    <Link to="/" style={S.logo}>
                        <div style={S.logoIcon}>IX</div>
                        <span style={S.logoText}>INTERNX</span>
                    </Link>
                    <span style={S.badge}>✨ AI WEB SEARCH</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        className="back-btn"
                        style={S.backBtn}
                        onClick={() => navigate('/searcher')}
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#3A4B41' }}>
                            {user?.profile?.fullName || 'User'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{user?.email}</div>
                    </div>
                </div>
            </header>

            {/* ─── Body ─── */}
            <div style={S.body}>

                {/* Hero */}
                <div style={S.hero}>
                    <div style={S.heroIcon}>
                        <Globe size={30} color="white" />
                    </div>
                    <h1 style={S.heroTitle}>Search Web for Opportunities</h1>
                    <p style={S.heroSub}>
                        Powered by AI — search real listings from LinkedIn, Indeed, Internshala, Naukri & more.<br />
                        Tell us what you're looking for and we'll find it.
                    </p>
                </div>

                {/* ─── Search Form ─── */}
                <div style={S.formCard}>
                    <div style={S.formGrid}>
                        {/* Opportunity Type */}
                        <div style={S.formGroup}>
                            <label style={S.label}>
                                <Briefcase size={14} color="#6366F1" /> Type of Opportunity
                            </label>
                            <select
                                className="web-input"
                                style={S.select}
                                value={form.opportunityType}
                                onChange={e => handleChange('opportunityType', e.target.value)}
                            >
                                {OPPORTUNITY_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Role / Title */}
                        <div style={S.formGroup}>
                            <label style={S.label}>
                                <Search size={14} color="#6366F1" /> Role / Job Title
                            </label>
                            <input
                                className="web-input"
                                style={S.input}
                                type="text"
                                placeholder="e.g. React Developer, Data Analyst…"
                                value={form.role}
                                onChange={e => handleChange('role', e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        {/* Area */}
                        <div style={S.formGroup}>
                            <label style={S.label}>
                                <MapPin size={14} color="#6366F1" /> Area / City
                            </label>
                            <input
                                className="web-input"
                                style={S.input}
                                type="text"
                                placeholder="e.g. Bangalore, Mumbai, Delhi…"
                                value={form.area}
                                onChange={e => handleChange('area', e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        {/* Work Mode */}
                        <div style={S.formGroup}>
                            <label style={S.label}>
                                <Wifi size={14} color="#6366F1" /> Work Mode
                            </label>
                            <div style={S.radioGroup}>
                                {WORK_MODES.map(mode => (
                                    <button
                                        key={mode}
                                        style={{
                                            ...S.radioBtn,
                                            ...(form.workMode === mode ? S.radioBtnActive : {}),
                                        }}
                                        onClick={() => handleChange('workMode', mode)}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={S.errorBox}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Search Button */}
                    <button
                        className="search-btn"
                        style={{ ...S.searchBtn, ...(loading ? S.searchBtnDisabled : {}) }}
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div style={{
                                    width: '18px', height: '18px',
                                    border: '2px solid rgba(230,207,166,0.4)',
                                    borderTop: '2px solid #E6CFA6',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                                Searching LinkedIn, Indeed, Internshala&hellip;
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Search Opportunities
                            </>
                        )}
                    </button>
                </div>

                {/* ─── Results ─── */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={S.loadingBox}
                        >
                            <div style={S.spinner} />
                            <p style={{ color: '#6B7280', fontWeight: '500' }}>
                                AI is searching across platforms…
                            </p>
                            <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '4px' }}>
                                LinkedIn · Indeed · Internshala · Naukri · Unstop · Devfolio
                            </p>
                        </motion.div>
                    )}

                    {!loading && searched && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        >
                            <div style={S.resultsHeader}>
                                <h2 style={S.resultsTitle}>
                                    Results for "{queryUsed}"
                                    {form.area && ` in ${form.area}`}
                                </h2>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={S.resultsMeta}>
                                        {results.length} opportunit{results.length !== 1 ? 'ies' : 'y'} found
                                    </span>
                                    {sourceUsed === 'smart_listings' && (

                                        <div style={{ fontSize: '11px', color: '#4F46E5', marginTop: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                            <Clock size={12} /> Results refreshed today

                                        </div>
                                    )}
                                </div>
                            </div>

                            {results.length === 0 ? (
                                <div style={S.emptyBox}>

                                    <Globe size={48} color="#94A3B8" style={{ marginBottom: '16px', opacity: 0.5 }} />
                                    <h3 style={{ color: '#1E293B', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                                        No Live Vacancies Found
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
                                        We couldn't find any direct matches on public platforms for this specific search right now.
                                    </p>

                                    <div style={S.tipBox}>
                                        <div style={S.tipTitle}>
                                            <Sparkles size={16} color="#6366F1" />
                                            Advanced Search Tips
                                        </div>
                                        <div style={S.tipList}>
                                            <div style={S.tipItem}>
                                                <div style={S.tipDot} />
                                                <span>Try a more generic title (e.g., "Developer" instead of "React Developer II")</span>
                                            </div>
                                            <div style={S.tipItem}>
                                                <div style={S.tipDot} />
                                                <span>Remove the location filter to see <b>Remote</b> opportunities</span>
                                            </div>
                                            <div style={S.tipItem}>
                                                <div style={S.tipDot} />
                                                <span>Check specific platform categories (e.g. Internshala for freshers)</span>
                                            </div>
                                            <div style={S.tipItem}>
                                                <div style={S.tipDot} />
                                                <span>Broaden your opportunity type (e.g. "Any" instead of "Internship")</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                results.map((r, i) => {
                                    const srcStyle = getSourceStyle(r.source);
                                    return (
                                        <motion.div
                                            key={r.id || i}
                                            className="result-card"
                                            style={S.resultCard}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            {r.is_verified && <div style={S.verifiedDot} />}

                                            <div style={{ paddingLeft: r.is_verified ? '12px' : '0' }}>
                                                {/* Card header */}
                                                <div style={S.resultCardHeader}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={S.resultTitle}>{r.title}</div>
                                                        <div style={S.resultCompany}>
                                                            <Building size={13} />
                                                            {r.company}
                                                        </div>
                                                    </div>

                                                    {/* Platform badge */}
                                                    <span style={{
                                                        ...S.sourceBadge,
                                                        background: srcStyle.bg,
                                                        color: srcStyle.color,
                                                        marginLeft: '12px',
                                                    }}>
                                                        {r.is_verified && '✓ '}{r.source}
                                                    </span>
                                                </div>

                                                {/* Meta */}
                                                <div style={S.metaRow}>
                                                    <span style={S.metaItem}>
                                                        <MapPin size={13} /> {r.location || 'Multiple Locations'}
                                                    </span>
                                                    {r.type && (
                                                        <span style={S.metaItem}>
                                                            <Briefcase size={13} /> {r.type}
                                                        </span>
                                                    )}
                                                    {r.salary && (
                                                        <span style={S.metaItem}>
                                                            💰 {r.salary}
                                                        </span>
                                                    )}
                                                    {r.posted_at && (


                                                        <span style={S.metaItem} title={new Date(r.posted_at).toLocaleString()}>
                                                            <Clock size={13} />
                                                            {formatRelativeDate(r.posted_at)}

                                                        </span>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                {r.description_snippet && (
                                                    <p style={S.description}>{r.description_snippet}</p>
                                                )}

                                                {/* Apply button */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <a
                                                        href={r.apply_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="apply-link"
                                                        style={S.applyBtn}
                                                    >
                                                        <ExternalLink size={14} />
                                                        Apply on {r.source}
                                                    </a>

                                                    {/* Save button */}
                                                    <button
                                                        onClick={() => handleSave(r)}
                                                        disabled={actionLoading.has(r.id)}
                                                        title={savedSet.has(r.id) ? 'Remove from saved' : 'Save for later'}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                            padding: '10px 16px', borderRadius: '8px', border: 'none',
                                                            cursor: actionLoading.has(r.id) ? 'wait' : 'pointer',
                                                            fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                                                            background: savedSet.has(r.id) ? '#FEF3C7' : '#F3F4F6',
                                                            color: savedSet.has(r.id) ? '#D97706' : '#374151',
                                                        }}
                                                    >
                                                        {savedSet.has(r.id) ? '🔖 Saved' : '🔖 Save'}
                                                    </button>

                                                    {/* Mark Applied button */}
                                                    <button
                                                        onClick={() => handleMarkApplied(r)}
                                                        disabled={actionLoading.has(r.id)}
                                                        title={appliedSet.has(r.id) ? 'Un-mark as applied' : 'Mark as applied (self-reported)'}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                            padding: '10px 16px', borderRadius: '8px', border: 'none',
                                                            cursor: actionLoading.has(r.id) ? 'wait' : 'pointer',
                                                            fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
                                                            background: appliedSet.has(r.id) ? '#D1FAE5' : '#F3F4F6',
                                                            color: appliedSet.has(r.id) ? '#059669' : '#374151',
                                                        }}
                                                    >
                                                        {appliedSet.has(r.id) ? '✅ Applied' : '✅ Mark Applied'}
                                                    </button>

                                                    {r.ai_generated && (
                                                        <span style={{
                                                            fontSize: '11px', color: '#6366F1',
                                                            background: '#F0F4FF', padding: '5px 12px',
                                                            borderRadius: '20px', fontWeight: '700',
                                                            display: 'flex', alignItems: 'center', gap: '5px',
                                                            border: '1px solid #C7D2FE',
                                                            boxShadow: '0 2px 8px rgba(99,102,241,0.15)',
                                                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                                        }}>
                                                            <Sparkles size={11} /> Smart Match
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
