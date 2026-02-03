import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, PublicRoute, RoleRedirect } from './components/auth/ProtectedRoute'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Landing from './pages/Landing.jsx'
import Builder from './pages/Builder.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import SignIn from './pages/auth/SignIn.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ProviderDashboard from './pages/provider/ProviderDashboard.jsx'
import SearcherDashboard from './pages/searcher/SearcherDashboard.jsx'

const styles = {
    app: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    },
    main: {
        flex: 1,
    },
}

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public routes with Navbar/Footer */}
                <Route path="/" element={
                    <div style={styles.app}>
                        <Navbar />
                        <main style={styles.main}><Landing /></main>
                        <Footer />
                    </div>
                } />
                <Route path="/builder" element={
                    <div style={styles.app}>
                        <Navbar />
                        <main style={styles.main}><Builder /></main>
                        <Footer />
                    </div>
                } />

                {/* Auth routes - no Navbar/Footer */}
                <Route path="/signup" element={
                    <PublicRoute><SignUp /></PublicRoute>
                } />
                <Route path="/signin" element={
                    <PublicRoute><SignIn /></PublicRoute>
                } />

                {/* Dashboard redirect based on role */}
                <Route path="/dashboard" element={<RoleRedirect />} />

                {/* Admin routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Job Provider routes */}
                <Route path="/provider" element={
                    <ProtectedRoute allowedRoles={['JOB_PROVIDER']}>
                        <ProviderDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/provider/*" element={
                    <ProtectedRoute allowedRoles={['JOB_PROVIDER']}>
                        <ProviderDashboard />
                    </ProtectedRoute>
                } />

                {/* Job Searcher routes */}
                <Route path="/searcher" element={
                    <ProtectedRoute allowedRoles={['JOB_SEARCHER']}>
                        <SearcherDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/searcher/*" element={
                    <ProtectedRoute allowedRoles={['JOB_SEARCHER']}>
                        <SearcherDashboard />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={
                    <div style={styles.app}>
                        <Navbar />
                        <main style={{ ...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '100px 20px' }}>
                            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#3A4B41' }}>404</h1>
                            <p style={{ color: '#6B7280' }}>Page not found</p>
                        </main>
                        <Footer />
                    </div>
                } />
            </Routes>
        </AuthProvider>
    )
}

export default App
