import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('No auth session');
  }
  return config;
});

export const analyzeThreats = async (message: string) => {
  const response = await apiClient.post('/api/analyze', { message });
  return response.data;
};

export default apiClient;
