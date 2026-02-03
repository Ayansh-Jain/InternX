/**
 * Authentication Context for global auth state management.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');

            if (storedUser && accessToken) {
                try {
                    // Verify token is still valid
                    const response = await authAPI.getMe();
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (err) {
                    // Token invalid - clear storage
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const signup = useCallback(async (email, password, fullName, role) => {
        setError(null);
        setLoading(true);
        try {
            const response = await authAPI.signup({
                email,
                password,
                fullName,
                role
            });

            const { access_token, refresh_token, user: userData } = response.data;

            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (err) {
            const message = err.response?.data?.detail || 'Signup failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const signin = useCallback(async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            const response = await authAPI.signin({ email, password });

            const { access_token, refresh_token, user: userData } = response.data;

            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (err) {
            const message = err.response?.data?.detail || 'Invalid credentials';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            // Ignore logout errors
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
        }
    }, []);

    const updateUser = useCallback((updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    }, [user]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Role check helpers
    const isAdmin = user?.role === 'ADMIN';
    const isJobProvider = user?.role === 'JOB_PROVIDER';
    const isJobSearcher = user?.role === 'JOB_SEARCHER';
    const isAuthenticated = !!user;

    // Get redirect path based on role
    const getRedirectPath = useCallback(() => {
        if (!user) return '/signin';
        switch (user.role) {
            case 'ADMIN':
                return '/admin';
            case 'JOB_PROVIDER':
                return '/provider';
            case 'JOB_SEARCHER':
                return '/searcher';
            default:
                return '/';
        }
    }, [user]);

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isJobProvider,
        isJobSearcher,
        signup,
        signin,
        logout,
        updateUser,
        clearError,
        getRedirectPath,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
