import axios from 'axios';
import Cookies from 'js-cookie';

function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001`;
  }

  return 'http://localhost:3001';
}

const api = axios.create({
  baseURL: `${getApiUrl()}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('fiestapp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password }).then(r => r.data);
export const register = (data) => api.post('/auth/register', data).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);
export const updateProfile = (data) => api.put('/auth/profile', data).then(r => r.data);

// Events
export const getEvents = (params) => api.get('/events', { params }).then(r => r.data);
export const getEvent = (id) => api.get(`/events/${id}`).then(r => r.data);
export const createEvent = (data) => api.post('/events', data).then(r => r.data);

// Attendance
export const attendEvent = (id, status = 'going') => api.post(`/events/${id}/attend`, { status }).then(r => r.data);
export const unattendEvent = (id) => api.delete(`/events/${id}/attend`).then(r => r.data);

// Friends
export const getFriends = () => api.get('/friends').then(r => r.data);
export const sendFriendRequest = (userId) => api.post('/friends/request', { addresseeId: userId }).then(r => r.data);
export const acceptFriendRequest = (id) => api.put(`/friends/${id}/accept`).then(r => r.data);

// Feed
export const getFeed = () => api.get('/feed').then(r => r.data);

// Users
export const searchUsers = (q) => api.get('/users/search', { params: { q } }).then(r => r.data);
export const getUser = (id) => api.get(`/users/${id}`).then(r => r.data);

// Posts
export const createPost = (data) => api.post('/posts', data).then(r => r.data);
export const getPosts = () => api.get('/posts').then(r => r.data);

export default api;
