const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getHeaders(isMultipart = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (geminiKey) {
    headers['x-gemini-key'] = geminiKey;
  }
  
  return headers;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const isMultipart = options.body instanceof FormData;
  const headers = {
    ...getHeaders(isMultipart),
    ...(options.headers as Record<string, string> || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_URL}/api${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error: any) {
    console.error(`API Error in ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  register: (body: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  onboard: (body: any) => apiRequest('/auth/onboarding', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => apiRequest('/auth/profile'),
  updateProfile: (body: any) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  
  // Mentor
  chat: (message: string, history: any[]) => apiRequest('/mentor/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  
  // Paths
  getPaths: () => apiRequest('/paths'),
  
  // Roadmaps
  generateRoadmap: (role: string) => apiRequest('/roadmaps/generate', { method: 'POST', body: JSON.stringify({ role }) }),
  getUserRoadmaps: () => apiRequest('/roadmaps/user'),
  completeStage: (id: string, stageName: string) => apiRequest(`/roadmaps/${id}/complete-stage`, { method: 'PUT', body: JSON.stringify({ stageName }) }),
  
  // Resumes
  analyzeResume: (formData: FormData) => apiRequest('/resumes/analyze', { method: 'POST', body: formData }),
  getResumeHistory: () => apiRequest('/resumes/history'),
  
  // Skills
  analyzeSkills: (targetRole: string) => apiRequest('/skills/analyze', { method: 'POST', body: JSON.stringify({ targetRole }) }),
  
  // Interviews
  startInterview: (role: string, type: string) => apiRequest('/interviews/start', { method: 'POST', body: JSON.stringify({ role, type }) }),
  submitInterview: (role: string, type: string, transcript: any[]) => apiRequest('/interviews/submit', { method: 'POST', body: JSON.stringify({ role, type, transcript }) }),
  getInterviewHistory: () => apiRequest('/interviews/history'),
  
  // Challenges
  getChallenges: () => apiRequest('/challenges'),
  submitChallenge: (id: string, code: string) => apiRequest(`/challenges/${id}/submit`, { method: 'POST', body: JSON.stringify({ code }) }),
  
  // Gamification
  getGamification: () => apiRequest('/gamification/status'),
  
  // Admin
  getAdminStats: () => apiRequest('/admin/analytics'),

  // Todos
  getTodos: () => apiRequest('/todos'),
  createTodo: (body: any) => apiRequest('/todos', { method: 'POST', body: JSON.stringify(body) }),
  updateTodo: (id: string, body: any) => apiRequest(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTodo: (id: string) => apiRequest(`/todos/${id}`, { method: 'DELETE' })
};
