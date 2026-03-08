import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use your computer's local IP for physical device, localhost for emulator
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001', // Android emulator
  ios: 'http://localhost:3001',
  default: 'http://localhost:3001',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to all requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // SecureStore not available (web)
  }
  return config;
});

// Auth
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const register = (data) =>
  api.post('/api/auth/register', data);

export const getMe = () =>
  api.get('/api/auth/me');

export const updateProfile = (data) =>
  api.put('/api/auth/profile', data);

// Events
export const getEvents = (params) =>
  api.get('/api/events', { params });

export const getEvent = (id) =>
  api.get(`/api/events/${id}`);

export const createEvent = (data) =>
  api.post('/api/events', data);

export const getGenres = () =>
  api.get('/api/genres');

// Attendance
export const attendEvent = (eventId, status = 'going') =>
  api.post(`/api/events/${eventId}/attend`, { status });

export const unattendEvent = (eventId) =>
  api.delete(`/api/events/${eventId}/attend`);

export const getAttendees = (eventId) =>
  api.get(`/api/events/${eventId}/attendees`);

// Friends
export const getFriends = () =>
  api.get('/api/friends');

export const getFriendRequests = () =>
  api.get('/api/friends/requests');

export const sendFriendRequest = (userId) =>
  api.post('/api/friends/request', { userId });

export const acceptFriendRequest = (id) =>
  api.put(`/api/friends/${id}/accept`);

export const removeFriend = (id) =>
  api.delete(`/api/friends/${id}`);

// Feed
export const getFeed = () =>
  api.get('/api/feed');

// Users
export const searchUsers = (q) =>
  api.get('/api/users/search', { params: { q } });

export const getUser = (id) =>
  api.get(`/api/users/${id}`);

// Posts
export const createPost = (data) =>
  api.post('/api/posts', data);

export const getPosts = (params) =>
  api.get('/api/posts', { params });

export default api;
