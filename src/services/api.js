/**
 * API service for making authenticated requests.
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
                        params: { refresh_token: refreshToken }
                    });

                    const { access_token, refresh_token } = response.data;
                    localStorage.setItem('accessToken', access_token);
                    localStorage.setItem('refreshToken', refresh_token);

                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/signin';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    signin: (data) => api.post('/auth/signin', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

// Profile API
export const profileAPI = {
    get: () => api.get('/profile'),
    update: (data) => api.put('/profile', data),
    getScore: () => api.get('/profile/score'),
    refreshScore: () => api.post('/profile/score/refresh'),
    generateBio: (data) => api.post('/generate-bio', data),
};

// Jobs API
export const jobsAPI = {
    list: (params) => api.get('/jobs', { params }),
    myJobs: (params) => api.get('/jobs/my-jobs', { params }),
    get: (id) => api.get(`/jobs/${id}`),
    create: (data) => api.post('/jobs', data),
    update: (id, data) => api.put(`/jobs/${id}`, data),
    delete: (id) => api.delete(`/jobs/${id}`),
    getApplicants: (id, params) => api.get(`/jobs/${id}/applicants`, { params }),
    predictMarket: (data) => api.post('/jobs/predict-market', data),
};

// Applications API
export const applicationsAPI = {
    list: (params) => api.get('/applications', { params }),
    get: (id) => api.get(`/applications/${id}`),
    apply: (data) => api.post('/applications', data),
    updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
    withdraw: (id) => api.delete(`/applications/${id}`),
    saveJob: (jobId) => api.post(`/applications/saved/${jobId}`),
    unsaveJob: (jobId) => api.delete(`/applications/saved/${jobId}`),
    getSavedJobs: (params) => api.get('/applications/saved', { params }),
};

// Admin API
export const adminAPI = {
    listUsers: (params) => api.get('/admin/users', { params }),
    blockUser: (id) => api.put(`/admin/users/${id}/block`),
    unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    listJobs: (params) => api.get('/admin/jobs', { params }),
    blockJob: (id) => api.put(`/admin/jobs/${id}/block`),
    deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
    getAnalytics: () => api.get('/admin/analytics'),
    getLogs: (params) => api.get('/admin/logs', { params }),
};

// External Job Search API
export const searchAPI = {
    external: (params) => api.get('/search/external', { params }),
};

// External Job Tracker API (save / mark-applied for web-search results)
export const externalJobsAPI = {
    save:        (job) => api.post('/external-jobs/save', job),
    unsave:      (extId) => api.delete(`/external-jobs/save/${encodeURIComponent(extId)}`),
    markApplied: (job) => api.post('/external-jobs/applied', job),
    unmarkApplied: (extId) => api.delete(`/external-jobs/applied/${encodeURIComponent(extId)}`),
    list:        (filterBy) => api.get('/external-jobs/', { params: { filter_by: filterBy } }),
};

// Recommendations API
export const recommendationsAPI = {
    getFeed: (params) => api.get('/recommendations/feed', { params }),
    interact: (data) => api.post('/recommendations/interact', data),
    getLikes: () => api.get('/recommendations/likes'),
    unlike: (jobId) => api.delete(`/recommendations/likes/${jobId}`),
};

// Resume API
export const resumeAPI = {
    customize: (data) => api.post('/customize-resume', data),
    parse: (fileData) => api.post('/resume/parse-resume', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
export default api;
